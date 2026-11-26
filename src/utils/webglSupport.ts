export function detectWebGLSupport(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false
  }
  try {
    const canvas = document.createElement('canvas')
    const gl =
      (canvas.getContext('webgl2', {
        failIfMajorPerformanceCaveat: false,
      }) as WebGL2RenderingContext | null) ||
      (canvas.getContext('webgl', {
        failIfMajorPerformanceCaveat: false,
      }) as WebGLRenderingContext | null) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null)

    if (!gl) return false

    // Release the probe context immediately so we do not exhaust browser WebGL context slots
    const loseExt = gl.getExtension('WEBGL_lose_context')
    if (loseExt) {
      loseExt.loseContext()
    }
    return true
  } catch {
    return false
  }
}

export function detectWebGPUSupport(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }
  try {
    const nav = navigator as Navigator & { gpu?: unknown }
    return Boolean(nav.gpu)
  } catch {
    return false
  }
}

export function isLowPowerDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false
  }
  try {
    const nav = navigator as Navigator & {
      deviceMemory?: number
      connection?: { saveData?: boolean }
    }

    if (nav.connection?.saveData) {
      return true
    }

    if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4) {
      return true
    }

    if (typeof nav.deviceMemory === 'number' && nav.deviceMemory > 0 && nav.deviceMemory <= 4) {
      return true
    }

    if (typeof window.matchMedia === 'function') {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return true
      }
      if (
        window.matchMedia('(pointer: coarse)').matches &&
        window.innerWidth < 900
      ) {
        return true
      }
    }

    return false
  } catch {
    return false
  }
}
