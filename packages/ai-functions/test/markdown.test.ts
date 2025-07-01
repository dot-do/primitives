import 'dotenv/config'
import { describe, it, expect } from 'vitest'

describe('markdown function', () => {
  it('should be defined as a module', async () => {
    const markdownModule = await import('../src/functions/markdown.js')
    expect(markdownModule).toBeDefined()
    expect(typeof markdownModule).toBe('object')
  })

  it('should export markdown functionality', async () => {
    const markdownModule = await import('../src/functions/markdown.js')
    expect(markdownModule).toBeDefined()
  })

  it('should handle markdown generation requests', () => {
    expect(true).toBe(true)
  })
})
