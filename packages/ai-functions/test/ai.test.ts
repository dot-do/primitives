import { describe, it, expect, beforeEach } from 'vitest'
import { ai } from '../src'
import { setupTestEnvironment } from './utils/setupTests'
import { testSchema, testNestedSchema, getTestPrompt, AI_TEST_TIMEOUT } from './utils/test-helpers'
import { z } from 'zod'

describe('ai template literal function', () => {
  beforeEach(() => {
    setupTestEnvironment()
  })

  describe('text generation', () => {
    it(
      'should generate text content',
      async () => {
        const result = await ai`${getTestPrompt('simple')}`

        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(10)
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should incorporate template variables',
      async () => {
        const topic = 'artificial intelligence'
        const result = await ai`Generate a short description of ${topic}`

        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(10)
        expect(result).toMatch(/\w+/) // Contains at least one word character
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should accept temperature settings',
      async () => {
        const prompt = getTestPrompt('simple')
        const result = await ai`${prompt}`({ temperature: 0.1 })

        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(10)
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should accept max token limit',
      async () => {
        const longPrompt = getTestPrompt('complex')
        const result = await ai`${longPrompt}`({ maxTokens: 200 })

        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
        expect(result.length).toBeLessThanOrEqual(1000) // Reasonable upper bound for maxTokens: 200
      },
      AI_TEST_TIMEOUT
    )
  })

  describe('structured data generation', () => {
    it(
      'should handle simple schemas',
      async () => {
        const result = await ai`${getTestPrompt('user-data')}`({ schema: testSchema })

        expect(result).toBeDefined()
        expect(typeof result).toBe('object')
        expect(result).toHaveProperty('name')
        expect(typeof result.name).toBe('string')
        expect(result).toHaveProperty('age')
        expect(typeof result.age).toBe('number')
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle complex schemas',
      async () => {
        const result = await ai`${getTestPrompt('nested-data')}`({ schema: testNestedSchema })

        expect(result).toBeDefined()
        expect(typeof result).toBe('object')
        expect(result).toHaveProperty('user')
        expect(typeof result.user).toBe('object')
        expect(result.user).toHaveProperty('name')
        expect(typeof result.user.name).toBe('string')
        expect(result.user).toHaveProperty('profile')
        expect(typeof result.user.profile).toBe('object')
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle array schemas',
      async () => {
        const arraySchema = z.array(z.string())
        const result = await ai`List 5 programming languages`({ schema: arraySchema })

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
      'should validate output against schemas',
      async () => {
        const strictSchema = z.object({
          name: z.string(),
          age: z.number(),
          email: z.string(),
        })

        const result = await ai`${getTestPrompt('user-data')}`({ schema: strictSchema })

        expect(result).toBeDefined()
        expect(typeof result).toBe('object')
        expect(result).toHaveProperty('name')
        expect(typeof result.name).toBe('string')
        expect(result).toHaveProperty('age')
        expect(typeof result.age).toBe('number')
        expect(result).toHaveProperty('email')
        expect(typeof result.email).toBe('string')
        expect(result.email).toMatch(/@/) // Basic email format check
      },
      AI_TEST_TIMEOUT
    )
  })

  describe('edge cases', () => {
    it(
      'should handle empty prompts',
      async () => {
        const result = await ai``

        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle very long prompts',
      async () => {
        const longPrompt = getTestPrompt('long')
        const result = await ai`${longPrompt}`

        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(50)
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle non-English content',
      async () => {
        const prompt = getTestPrompt('non-english')
        const result = await ai`${prompt}`

        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle special characters',
      async () => {
        const prompt = getTestPrompt('special-chars')
        const result = await ai`${prompt}`

        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      },
      AI_TEST_TIMEOUT
    )
  })

  describe('error handling', () => {
    it(
      'should handle JSON parsing errors gracefully',
      async () => {
        const result = await ai`Generate invalid JSON response`({ 
          schema: testSchema,
          model: 'mock-invalid-json' 
        })
        
        expect(result).toBeDefined()
        expect(typeof result).toBe('object')
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle schema validation failures',
      async () => {
        const strictSchema = z.object({
          requiredField: z.string(),
          numericField: z.number().min(100)
        })
        
        const result = await ai`Generate data that might not match schema`({ 
          schema: strictSchema 
        })
        
        expect(result).toBeDefined()
        expect(typeof result).toBe('object')
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle provider connection failures',
      async () => {
        const result = await ai`Test prompt`({ 
          model: 'non-existent-provider' 
        })
        
        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle malformed template literals',
      async () => {
        expect(() => {
          ai()
        }).toThrow('Not implemented yet')
      }
    )

    it(
      'should handle empty schema gracefully',
      async () => {
        const result = await ai`Generate content`({ schema: null })
        
        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle invalid configuration options',
      async () => {
        const result = await ai`Test prompt`({ 
          temperature: -1,
          maxTokens: -100
        })
        
        expect(result).toBeDefined()
        expect(typeof result).toBe('string')
      },
      AI_TEST_TIMEOUT
    )
  })
})
