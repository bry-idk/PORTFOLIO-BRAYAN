// Lightweight procedural Web Audio synthesizer for Notas y Colores 4-lane pad

let audioCtx: AudioContext | null = null

const LANE_FREQS = [261.63, 329.63, 392.0, 523.25] // C4, E4, G4, C5 (warm major synesthetic triad + octave)
const LANE_HARMONICS = [523.25, 659.25, 783.99, 1046.5]

export function playLaneNote(laneIndex: number): void {
  if (typeof window === 'undefined') return
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  if (!AudioContextClass) return

  try {
    if (!audioCtx) {
      audioCtx = new AudioContextClass()
    }
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume()
    }

    const now = audioCtx.currentTime
    const idx = Math.max(0, Math.min(3, laneIndex))

    const osc1 = audioCtx.createOscillator()
    const osc2 = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    const filter = audioCtx.createBiquadFilter()

    osc1.type = 'triangle'
    osc2.type = 'sine'
    osc1.frequency.setValueAtTime(LANE_FREQS[idx], now)
    osc2.frequency.setValueAtTime(LANE_HARMONICS[idx], now)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2800, now)
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.35)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.16, now + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.42)

    osc1.connect(filter)
    osc2.connect(filter)
    filter.connect(gain)
    gain.connect(audioCtx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.45)
    osc2.stop(now + 0.45)
  } catch {
    // Graceful no-op if audio is restricted
  }
}
