import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  esbuild: {
    target: 'node14'
  },
  css: {
    postcss: false
  }
})
