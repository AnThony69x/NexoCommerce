import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// RTL no limpia solo (sin globals de test), asi que se hace explicito.
afterEach(() => {
  cleanup()
})

// jsdom no implementa matchMedia y algunas librerias lo consultan.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}
