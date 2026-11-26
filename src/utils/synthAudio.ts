// Procedural Web Audio engine:
// - Warm synesthetic 4-lane harmonic synthesizer for Notas y Colores
// - Subtle tactile hover/interaction micro-ticks
// - Opt-in meditative studio ambient drone with gentle LFO filter breathing

let audioCtx: AudioContext | null = null
let muted = false
let droneActive = false
let lastTickMs = 0

interface DroneGraph {
  oscRoot: OscillatorNode
  oscFifth: OscillatorNode
  oscAir: OscillatorNode
  lfo: OscillatorNode
  lfoGain: GainNode
  filter: BiquadFilterNode
  masterGain: GainNode
}

let droneGraph: DroneGraph | null = null
let droneStopTimer: number | null = null

const LANE_FREQS = [261.63, 329.63, 392.0, 523.25] // C4, E4, G4, C5
const LANE_HARMONICS = [523.25, 659.25, 783.99, 1046.5] // Octave shimmer
const LANE_FIFTHS = [392.0, 493.88, 587.33, 783.99] // Subtle warm overtone
const LANE_PANS = [-0.52, -0.18, 0.18, 0.52]

const DRONE_TARGET_GAIN = 0.042

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  if (!AudioContextClass) return null

  try {
    if (!audioCtx) {
      audioCtx = new AudioContextClass()
    }
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume()
    }
    return audioCtx
  } catch {
    return null
  }
}

export function playLaneNote(laneIndex: number): void {
  if (muted) return
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const now = ctx.currentTime
    const idx = Math.max(0, Math.min(3, Math.floor(laneIndex)))

    const oscFundamental = ctx.createOscillator()
    const oscOctave = ctx.createOscillator()
    const oscWarm = ctx.createOscillator()

    const warmGain = ctx.createGain()
    const octaveGain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    const envGain = ctx.createGain()

    oscFundamental.type = 'triangle'
    oscOctave.type = 'sine'
    oscWarm.type = 'sine'

    oscFundamental.frequency.setValueAtTime(LANE_FREQS[idx], now)
    oscOctave.frequency.setValueAtTime(LANE_HARMONICS[idx], now)
    oscWarm.frequency.setValueAtTime(LANE_FIFTHS[idx], now)
    oscWarm.detune.setValueAtTime(4.5, now)

    octaveGain.gain.setValueAtTime(0.32, now)
    warmGain.gain.setValueAtTime(0.14, now)

    filter.type = 'lowpass'
    filter.Q.setValueAtTime(1.4, now)
    filter.frequency.setValueAtTime(3400, now)
    filter.frequency.exponentialRampToValueAtTime(620, now + 0.42)

    envGain.gain.setValueAtTime(0.0008, now)
    envGain.gain.linearRampToValueAtTime(0.15, now + 0.014)
    envGain.gain.exponentialRampToValueAtTime(0.0006, now + 0.5)

    oscFundamental.connect(filter)
    oscOctave.connect(octaveGain)
    octaveGain.connect(filter)
    oscWarm.connect(warmGain)
    warmGain.connect(filter)
    filter.connect(envGain)

    let panner: StereoPannerNode | null = null
    if (typeof ctx.createStereoPanner === 'function') {
      panner = ctx.createStereoPanner()
      panner.pan.setValueAtTime(LANE_PANS[idx], now)
      envGain.connect(panner)
      panner.connect(ctx.destination)
    } else {
      envGain.connect(ctx.destination)
    }

    oscFundamental.start(now)
    oscOctave.start(now)
    oscWarm.start(now)

    const stopAt = now + 0.54
    oscFundamental.stop(stopAt)
    oscOctave.stop(stopAt)
    oscWarm.stop(stopAt)

    oscFundamental.onended = () => {
      try {
        oscFundamental.disconnect()
        oscOctave.disconnect()
        oscWarm.disconnect()
        octaveGain.disconnect()
        warmGain.disconnect()
        filter.disconnect()
        envGain.disconnect()
        panner?.disconnect()
      } catch {
        // Ignore teardown errors
      }
    }
  } catch {
    // Graceful no-op if audio is restricted
  }
}

export function playHoverTick(enabled = true): void {
  if (!enabled || muted) return
  const nowMs =
    typeof performance !== 'undefined' ? performance.now() : Date.now()
  if (nowMs - lastTickMs < 65) return
  lastTickMs = nowMs

  const ctx = getAudioContext()
  if (!ctx || ctx.state !== 'running') return

  try {
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(1240, now)
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.028)

    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1100, now)
    filter.Q.setValueAtTime(1.8, now)

    gain.gain.setValueAtTime(0.0005, now)
    gain.gain.linearRampToValueAtTime(0.022, now + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.0004, now + 0.032)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.038)
    osc.onended = () => {
      try {
        osc.disconnect()
        filter.disconnect()
        gain.disconnect()
      } catch {
        // Ignore teardown errors
      }
    }
  } catch {
    // Graceful no-op
  }
}

function teardownDroneImmediate(): void {
  if (droneStopTimer !== null && typeof window !== 'undefined') {
    window.clearTimeout(droneStopTimer)
    droneStopTimer = null
  }
  if (!droneGraph) return
  const g = droneGraph
  droneGraph = null
  try {
    g.oscRoot.stop()
    g.oscFifth.stop()
    g.oscAir.stop()
    g.lfo.stop()
  } catch {
    // Oscillators may already be stopped
  }
  try {
    g.oscRoot.disconnect()
    g.oscFifth.disconnect()
    g.oscAir.disconnect()
    g.lfo.disconnect()
    g.lfoGain.disconnect()
    g.filter.disconnect()
    g.masterGain.disconnect()
  } catch {
    // Ignore disconnect errors
  }
}

export function toggleAmbientDrone(enabled: boolean): boolean {
  if (!enabled) {
    droneActive = false
    if (droneGraph && audioCtx) {
      try {
        const now = audioCtx.currentTime
        const currentGain = droneGraph.masterGain.gain
        currentGain.cancelScheduledValues(now)
        currentGain.setValueAtTime(Math.max(currentGain.value, 0.0001), now)
        currentGain.exponentialRampToValueAtTime(0.0001, now + 0.32)

        if (typeof window !== 'undefined') {
          if (droneStopTimer !== null) {
            window.clearTimeout(droneStopTimer)
          }
          droneStopTimer = window.setTimeout(() => {
            if (!droneActive) {
              teardownDroneImmediate()
            }
          }, 360)
        } else {
          teardownDroneImmediate()
        }
      } catch {
        teardownDroneImmediate()
      }
    }
    return false
  }

  const ctx = getAudioContext()
  if (!ctx) {
    droneActive = false
    return false
  }

  if (droneStopTimer !== null && typeof window !== 'undefined') {
    window.clearTimeout(droneStopTimer)
    droneStopTimer = null
  }

  try {
    const now = ctx.currentTime

    if (droneGraph) {
      droneActive = true
      const gainParam = droneGraph.masterGain.gain
      gainParam.cancelScheduledValues(now)
      gainParam.setValueAtTime(Math.max(gainParam.value, 0.0001), now)
      gainParam.linearRampToValueAtTime(
        muted ? 0.0001 : DRONE_TARGET_GAIN,
        now + 0.55
      )
      return true
    }

    const oscRoot = ctx.createOscillator()
    const oscFifth = ctx.createOscillator()
    const oscAir = ctx.createOscillator()
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    const fifthGain = ctx.createGain()
    const airGain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    const masterGain = ctx.createGain()

    // Warm obsidian gallery chord: C2 + G2 + subtle detuned D3
    oscRoot.type = 'sine'
    oscRoot.frequency.setValueAtTime(65.41, now)

    oscFifth.type = 'triangle'
    oscFifth.frequency.setValueAtTime(98.0, now)
    oscFifth.detune.setValueAtTime(-3.5, now)
    fifthGain.gain.setValueAtTime(0.42, now)

    oscAir.type = 'sine'
    oscAir.frequency.setValueAtTime(146.83, now)
    oscAir.detune.setValueAtTime(5.0, now)
    airGain.gain.setValueAtTime(0.18, now)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(290, now)
    filter.Q.setValueAtTime(1.1, now)

    // Slow 0.085Hz breath modulation
    lfo.type = 'sine'
    lfo.frequency.setValueAtTime(0.085, now)
    lfoGain.gain.setValueAtTime(115, now)

    masterGain.gain.setValueAtTime(0.0001, now)
    masterGain.gain.linearRampToValueAtTime(
      muted ? 0.0001 : DRONE_TARGET_GAIN,
      now + 0.85
    )

    oscRoot.connect(filter)
    oscFifth.connect(fifthGain)
    fifthGain.connect(filter)
    oscAir.connect(airGain)
    airGain.connect(filter)

    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)

    filter.connect(masterGain)
    masterGain.connect(ctx.destination)

    oscRoot.start(now)
    oscFifth.start(now)
    oscAir.start(now)
    lfo.start(now)

    droneGraph = {
      oscRoot,
      oscFifth,
      oscAir,
      lfo,
      lfoGain,
      filter,
      masterGain,
    }
    droneActive = true
    return true
  } catch {
    droneActive = false
    teardownDroneImmediate()
    return false
  }
}

export function isAmbientDroneActive(): boolean {
  return droneActive
}

export function setAudioMuted(nextMuted: boolean): void {
  muted = Boolean(nextMuted)
  if (droneGraph && audioCtx) {
    try {
      const now = audioCtx.currentTime
      const gainParam = droneGraph.masterGain.gain
      gainParam.cancelScheduledValues(now)
      gainParam.setValueAtTime(Math.max(gainParam.value, 0.0001), now)
      gainParam.linearRampToValueAtTime(
        muted || !droneActive ? 0.0001 : DRONE_TARGET_GAIN,
        now + 0.18
      )
    } catch {
      // Ignore audio context state errors
    }
  }
}

export function isAudioMuted(): boolean {
  return muted
}
