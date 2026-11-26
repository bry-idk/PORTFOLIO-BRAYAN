/**
 * Pure MediaPipe Hand Landmark -> Mid-Air Scroll Gesture Engine
 *
 * Designed for comfortable, low-fatigue hands-free portfolio navigation:
 * - Closed Fist (`fist`): Brake / pause scroll immediately while repositioning
 * - Thumb + Index Pinch (`pinch`): Precision 1:1 air-drag scroll
 * - Open Hand Vertical Zones:
 *     y < 0.36  -> Smooth continuous scroll UP (`open_up`)
 *     0.36..0.64 -> Resting neutral hold zone (`open_hold`)
 *     y > 0.64  -> Smooth continuous scroll DOWN (`open_down`)
 */

export interface HandLandmarkPoint {
  x: number
  y: number
  z?: number
}

export type AirScrollGesture =
  | 'none'
  | 'fist'
  | 'pinch'
  | 'open_up'
  | 'open_hold'
  | 'open_down'

export interface AirScrollTrackerState {
  smoothedY: number | null
  smoothedVelocity: number
  isPinching: boolean
  lastPinchY: number | null
  gesture: AirScrollGesture
}

export interface AirScrollFrameInput {
  landmarks: HandLandmarkPoint[] | null | undefined
  prevState: AirScrollTrackerState
  dtSeconds: number
  viewportHeight: number
  sensitivity?: number
}

export interface AirScrollFrameResult {
  deltaY: number
  gesture: AirScrollGesture
  handY: number | null
  pinchStrength: number
  nextState: AirScrollTrackerState
}

export const INITIAL_AIR_SCROLL_STATE: AirScrollTrackerState = {
  smoothedY: null,
  smoothedVelocity: 0,
  isPinching: false,
  lastPinchY: null,
  gesture: 'none',
}

export const AIR_SCROLL_UPPER_ZONE_END = 0.36
export const AIR_SCROLL_LOWER_ZONE_START = 0.64

function dist2D(a: HandLandmarkPoint, b: HandLandmarkPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function isFingerExtended(
  wrist: HandLandmarkPoint,
  pip: HandLandmarkPoint,
  tip: HandLandmarkPoint,
  midMcp: HandLandmarkPoint,
  palmScale: number
): boolean {
  const tipFromWrist = dist2D(wrist, tip)
  const pipFromWrist = dist2D(wrist, pip)
  const tipFromPalm = dist2D(midMcp, tip)
  return tipFromWrist > pipFromWrist * 1.07 && tipFromPalm > palmScale * 0.72
}

/**
 * Classifies MediaPipe's 21 hand landmarks into a high-precision scroll gesture
 * normalized against palm scale so distance from the camera remains consistent.
 */
export function evaluateAirScrollFrame({
  landmarks,
  prevState,
  dtSeconds,
  viewportHeight,
  sensitivity = 1.0,
}: AirScrollFrameInput): AirScrollFrameResult {
  const safeDt = Math.max(0.004, Math.min(dtSeconds, 0.1))
  const safeHeight = Math.max(360, viewportHeight)
  const speedScale = Math.max(0.4, Math.min(2.2, sensitivity))

  if (!landmarks || landmarks.length < 21) {
    // Smoothly decay momentum when hand leaves frame
    const decayedVel =
      Math.abs(prevState.smoothedVelocity) < 0.4
        ? 0
        : prevState.smoothedVelocity * Math.pow(0.002, safeDt)
    return {
      deltaY: decayedVel * safeDt,
      gesture: 'none',
      handY: null,
      pinchStrength: 0,
      nextState: {
        smoothedY: null,
        smoothedVelocity: decayedVel,
        isPinching: false,
        lastPinchY: null,
        gesture: 'none',
      },
    }
  }

  const wrist = landmarks[0]
  const thumbTip = landmarks[4]
  const indexPip = landmarks[6]
  const indexTip = landmarks[8]
  const midMcp = landmarks[9]
  const middlePip = landmarks[10]
  const middleTip = landmarks[12]
  const ringPip = landmarks[14]
  const ringTip = landmarks[16]
  const pinkyPip = landmarks[18]
  const pinkyTip = landmarks[20]

  const palmScale = Math.max(0.055, dist2D(wrist, midMcp))

  const indexOpen = isFingerExtended(wrist, indexPip, indexTip, midMcp, palmScale)
  const middleOpen = isFingerExtended(wrist, middlePip, middleTip, midMcp, palmScale)
  const ringOpen = isFingerExtended(wrist, ringPip, ringTip, midMcp, palmScale)
  const pinkyOpen = isFingerExtended(wrist, pinkyPip, pinkyTip, midMcp, palmScale)

  const openFingerCount =
    (indexOpen ? 1 : 0) +
    (middleOpen ? 1 : 0) +
    (ringOpen ? 1 : 0) +
    (pinkyOpen ? 1 : 0)

  const pinchRatio = dist2D(thumbTip, indexTip) / palmScale
  const pinchThreshold = prevState.isPinching ? 0.56 : 0.42
  const pinchStrength = Math.max(0, Math.min(1, 1 - (pinchRatio - 0.2) / 0.55))

  // Smooth palm anchor vertically (weighted between wrist and middle knuckle)
  const rawHandY = Math.max(0, Math.min(1, wrist.y * 0.35 + midMcp.y * 0.65))
  const alpha = 1 - Math.exp(-safeDt * 14)
  const handY =
    prevState.smoothedY === null
      ? rawHandY
      : prevState.smoothedY + (rawHandY - prevState.smoothedY) * alpha

  // Closed fist: all 4 fingers folded -> explicit brake / pause
  const isClosedFist =
    openFingerCount === 0 &&
    !middleOpen &&
    !ringOpen &&
    !pinkyOpen &&
    dist2D(midMcp, indexTip) < palmScale * 0.92

  if (isClosedFist) {
    return {
      deltaY: 0,
      gesture: 'fist',
      handY,
      pinchStrength: 0,
      nextState: {
        smoothedY: handY,
        smoothedVelocity: 0,
        isPinching: false,
        lastPinchY: null,
        gesture: 'fist',
      },
    }
  }

  // Pinch drag: thumb & index together while hand isn't in a closed fist
  if (pinchRatio < pinchThreshold && (middleOpen || ringOpen || pinkyOpen || prevState.isPinching)) {
    const prevDragY = prevState.isPinching && prevState.lastPinchY !== null ? prevState.lastPinchY : handY
    const dyNorm = prevDragY - handY
    // Natural drag-to-scroll: lifting hand pulls content down (scrolls down cleanly)
    const rawDelta = Math.abs(dyNorm) < 0.0025 ? 0 : dyNorm * safeHeight * 2.1 * speedScale
    const clampedDelta = Math.max(-96, Math.min(96, rawDelta))
    return {
      deltaY: clampedDelta,
      gesture: 'pinch',
      handY,
      pinchStrength,
      nextState: {
        smoothedY: handY,
        smoothedVelocity: clampedDelta / safeDt,
        isPinching: true,
        lastPinchY: handY,
        gesture: 'pinch',
      },
    }
  }

  // Open palm zone cruise (Top = scroll up, Center = steady hold, Bottom = scroll down)
  let targetVelocity = 0
  let gesture: AirScrollGesture = 'open_hold'
  const maxPxPerSec = safeHeight * 1.15 * speedScale

  if (handY < AIR_SCROLL_UPPER_ZONE_END) {
    gesture = 'open_up'
    const depth = (AIR_SCROLL_UPPER_ZONE_END - handY) / AIR_SCROLL_UPPER_ZONE_END
    targetVelocity = -Math.pow(Math.min(1, depth), 1.35) * maxPxPerSec
  } else if (handY > AIR_SCROLL_LOWER_ZONE_START) {
    gesture = 'open_down'
    const span = 1 - AIR_SCROLL_LOWER_ZONE_START
    const depth = (handY - AIR_SCROLL_LOWER_ZONE_START) / span
    targetVelocity = Math.pow(Math.min(1, depth), 1.35) * maxPxPerSec
  }

  const velAlpha = 1 - Math.exp(-safeDt * 9.5)
  const smoothedVelocity =
    prevState.smoothedVelocity + (targetVelocity - prevState.smoothedVelocity) * velAlpha
  const effectiveVel = Math.abs(smoothedVelocity) < 6 && targetVelocity === 0 ? 0 : smoothedVelocity

  return {
    deltaY: effectiveVel * safeDt,
    gesture,
    handY,
    pinchStrength,
    nextState: {
      smoothedY: handY,
      smoothedVelocity: effectiveVel,
      isPinching: false,
      lastPinchY: null,
      gesture,
    },
  }
}
