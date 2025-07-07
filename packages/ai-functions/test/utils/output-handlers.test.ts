import { describe, it, expect } from 'vitest'
import { handleStringOutput, handleArrayOutput, handleObjectOutput } from '../../src/utils/output-handlers'
import { AI_TEST_TIMEOUT } from './test-helpers'

describe('output-handlers utility', () => {
  describe('handleStringOutput', () => {
    it(
      'should handle successful string generation',
      async () => {
        const result = await handleStringOutput('Generate a test string')
        
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle provider errors gracefully',
      async () => {
        const result = await handleStringOutput('Test prompt', 'invalid-model')
        
        expect(typeof result).toBe('string')
        expect(result).toContain('default response')
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle empty prompts',
      async () => {
        const result = await handleStringOutput('')
        
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle undefined model gracefully',
      async () => {
        const result = await handleStringOutput('Test prompt', undefined)
        
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      },
      AI_TEST_TIMEOUT
    )
  })

  describe('handleArrayOutput', () => {
    it(
      'should parse numbered lists correctly',
      async () => {
        const result = await handleArrayOutput('List 3 items')
        
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle malformed list responses',
      async () => {
        const result = await handleArrayOutput('Generate malformed list', 'error-model')
        
        expect(Array.isArray(result)).toBe(true)
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should fallback to default items on provider failure',
      async () => {
        const result = await handleArrayOutput('Test', 'non-existent-model')
        
        expect(Array.isArray(result)).toBe(true)
        expect(result).toEqual(['Default item 1', 'Default item 2', 'Default item 3'])
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle bullet point lists',
      async () => {
        const result = await handleArrayOutput('Generate bullet list')
        
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThanOrEqual(0)
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle empty responses',
      async () => {
        const result = await handleArrayOutput('')
        
        expect(Array.isArray(result)).toBe(true)
      },
      AI_TEST_TIMEOUT
    )
  })

  describe('handleObjectOutput', () => {
    it(
      'should handle valid JSON responses',
      async () => {
        const schema = { name: 'string', age: 'number' }
        const result = await handleObjectOutput('Generate user data', schema)
        
        expect(typeof result).toBe('object')
        expect(result).toBeDefined()
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle JSON parsing errors',
      async () => {
        const schema = { field: 'string' }
        const result = await handleObjectOutput('Generate invalid JSON', schema, 'error-model')
        
        expect(typeof result).toBe('object')
        expect(result).toHaveProperty('field')
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should create fallback objects for provider failures',
      async () => {
        const schema = { 
          name: 'string', 
          tags: ['string'],
          settings: { theme: 'light|dark' }
        }
        const result = await handleObjectOutput('Test', schema, 'non-existent-model')
        
        expect(result).toHaveProperty('name')
        expect(result).toHaveProperty('tags')
        expect(Array.isArray(result.tags)).toBe(true)
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle schema validation failures',
      async () => {
        const schema = { required: 'string' }
        const result = await handleObjectOutput('Generate wrong data', schema)
        
        expect(typeof result).toBe('object')
        expect(result).toBeDefined()
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle complex nested schemas',
      async () => {
        const schema = {
          user: {
            profile: {
              name: 'string',
              age: 'number'
            },
            settings: {
              theme: 'light|dark',
              notifications: 'boolean'
            }
          },
          metadata: {
            tags: ['string']
          }
        }
        const result = await handleObjectOutput('Generate complex data', schema)
        
        expect(typeof result).toBe('object')
        expect(result).toHaveProperty('user')
        expect(result).toHaveProperty('metadata')
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle enum validation with pipe separator',
      async () => {
        const schema = { 
          status: 'active|inactive|pending',
          priority: 'low|medium|high'
        }
        const result = await handleObjectOutput('Generate status data', schema)
        
        expect(typeof result).toBe('object')
        expect(result).toHaveProperty('status')
        expect(result).toHaveProperty('priority')
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle empty schema objects',
      async () => {
        const schema = {}
        const result = await handleObjectOutput('Generate data', schema)
        
        expect(typeof result).toBe('object')
        expect(result).toBeDefined()
      },
      AI_TEST_TIMEOUT
    )
  })
})
