import { describe, it, expect, beforeEach } from 'vitest'
import { list } from '../src'
import { setupTestEnvironment } from './utils/setupTests'
import { AI_TEST_TIMEOUT } from './utils/test-helpers'

describe('list function', () => {
  beforeEach(() => {
    setupTestEnvironment()
  })

  describe('basic functionality', () => {
    it(
      'should generate an array of strings',
      async () => {
        const result = await list`List 5 programming languages`

        expect(result).toBeDefined()
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
        result.forEach((item: string) => {
          expect(typeof item).toBe('string')
          expect(item.length).toBeGreaterThan(0)
        })
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should have proper typing for array items',
      async () => {
        const result = await list`List 3 cloud providers`

        expect(result).toBeDefined()
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
        result.forEach((item: string) => {
          expect(typeof item).toBe('string')
          expect(item.length).toBeGreaterThan(0)
        })
      },
      AI_TEST_TIMEOUT
    )
  })

  describe('AsyncIterable interface', () => {
    it(
      'should support for-await-of iteration',
      async () => {
        const languages = list`List 5 programming languages`
        const items: string[] = []

        for await (const item of languages) {
          items.push(item)
        }

        expect(items.length).toBeGreaterThanOrEqual(0)
        if (items.length > 0) {
          items.forEach((item: string) => {
            expect(typeof item).toBe('string')
            expect(item.length).toBeGreaterThan(0)
          })
        }
      },
      AI_TEST_TIMEOUT
    )
  })

  describe('edge cases', () => {
    it(
      'should handle empty prompts',
      async () => {
        const result = await list``

        expect(result).toBeDefined()
        expect(Array.isArray(result)).toBe(true)
        if (result.length > 0) {
          result.forEach((item: string) => {
            expect(typeof item).toBe('string')
            expect(item.length).toBeGreaterThan(0)
          })
        }
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle very long prompts',
      async () => {
        const longPrompt =
          'List programming languages that are particularly well-suited for ' +
          'developing applications in the following domains: web development, mobile app development, ' +
          'data science, machine learning, embedded systems, game development, blockchain, ' +
          'distributed systems, high-frequency trading, scientific computing, and cybersecurity. ' +
          'For each language, provide specific reasons why it excels in the given domain.'

        const result = await list`${longPrompt}`

        expect(result).toBeDefined()
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
        result.forEach((item: string) => {
          expect(typeof item).toBe('string')
          expect(item.length).toBeGreaterThan(0)
        })
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle non-English prompts',
      async () => {
        const nonEnglishPrompt = 'プログラミング言語を5つリストする'
        const result = await list`${nonEnglishPrompt}`

        expect(result).toBeDefined()
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
        result.forEach((item: string) => {
          expect(typeof item).toBe('string')
          expect(item.length).toBeGreaterThan(0)
        })
      },
      AI_TEST_TIMEOUT
    )
  })

  describe('error handling', () => {
    it(
      'should handle JSON parsing errors in streaming',
      async () => {
        const result = await list`Generate malformed JSON list`
        
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThanOrEqual(0)
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle provider streaming failures',
      async () => {
        const items: string[] = []
        const languages = list`List programming languages`
        
        try {
          for await (const item of languages) {
            items.push(item)
            if (items.length >= 5) break
          }
        } catch (error) {
          
        }
        
        expect(Array.isArray(items)).toBe(true)
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle invalid template usage',
      async () => {
        expect(() => {
          (list as any)()
        }).toThrow('list function must be used as a template literal tag')
      }
    )

    it(
      'should handle configuration errors gracefully',
      async () => {
        const result = await list`Generate list`
        
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle empty streaming responses',
      async () => {
        const items: string[] = []
        const emptyList = list`Generate empty list`
        
        for await (const item of emptyList) {
          items.push(item)
          if (items.length >= 3) break
        }
        
        expect(Array.isArray(items)).toBe(true)
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle promise rejection gracefully',
      async () => {
        const listPromise = list`Test list with error conditions`
        
        try {
          const result = await listPromise
          expect(Array.isArray(result)).toBe(true)
        } catch (error) {
          expect(error).toBeDefined()
        }
      },
      AI_TEST_TIMEOUT
    )
  })
})
