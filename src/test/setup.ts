import '@testing-library/jest-dom'

// Browser polyfills for jsdom unit tests
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== 'undefined') {
  window.ResizeObserver =
    window.ResizeObserver ||
    (ResizeObserverMock as unknown as typeof ResizeObserver)
  window.IntersectionObserver =
    window.IntersectionObserver ||
    (IntersectionObserverMock as unknown as typeof IntersectionObserver)
  window.matchMedia =
    window.matchMedia ||
    ((query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList)
  window.scrollTo = window.scrollTo || (() => {})
  if (typeof HTMLCanvasElement !== 'undefined') {
    HTMLCanvasElement.prototype.getContext = (() => null) as unknown as typeof HTMLCanvasElement.prototype.getContext
  }
}
