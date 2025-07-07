import { describe, it, expect, beforeEach } from 'vitest'
import { AI } from '../src'
import { setupTestEnvironment } from './utils/setupTests'
import { AI_TEST_TIMEOUT } from './utils/test-helpers'

describe('AI factory function', () => {
  beforeEach(() => {
    setupTestEnvironment()
  })

  it(
    'should create a type-safe function definition',
    async () => {
      const testAI = AI({
        getUser: { name: 'string', age: 'number' },
      })

      expect(testAI).toBeDefined()
      expect(typeof testAI.getUser).toBe('function')
    },
    AI_TEST_TIMEOUT
  )

  it(
    'should execute functions with various inputs',
    async () => {
      const testAI = AI({
        generateContent: {
          title: 'string',
          content: 'string',
          wordCount: 'number',
        },
      })

      const content = await testAI.generateContent({
        type: 'blog post',
        topic: 'AI',
        length: 'short',
      })

      expect(content).toBeDefined()
      expect(typeof content).toBe('object')
      expect(content).toHaveProperty('title')
      expect(typeof content.title).toBe('string')
      expect(content).toHaveProperty('content')
      expect(typeof content.content).toBe('string')
      expect(content).toHaveProperty('wordCount')
      expect(typeof content.wordCount).toBe('number')
    },
    AI_TEST_TIMEOUT
  )

  it(
    'should handle complex nested schema',
    async () => {
      const testAI = AI({
        getProductDetails: {
          product: {
            id: 'string',
            name: 'string',
            price: 'number',
            specifications: {
              dimensions: 'string',
              weight: 'string',
            },
          },
          inventory: {
            inStock: 'boolean',
            quantity: 'number',
          },
          reviews: ['string'],
        },
      })

      const productDetails = await testAI.getProductDetails({
        productId: '123',
        includeReviews: true,
      })

      expect(productDetails).toBeDefined()
      expect(typeof productDetails).toBe('object')
      
      expect(productDetails).toHaveProperty('product')
      expect(typeof productDetails.product).toBe('object')
      expect(productDetails.product).toHaveProperty('id')
      expect(typeof productDetails.product.id).toBe('string')
      expect(productDetails.product).toHaveProperty('name')
      expect(typeof productDetails.product.name).toBe('string')
      expect(productDetails.product).toHaveProperty('price')
      expect(typeof productDetails.product.price).toBe('number')
      
      expect(productDetails.product).toHaveProperty('specifications')
      expect(typeof productDetails.product.specifications).toBe('object')
      
      expect(productDetails).toHaveProperty('inventory')
      expect(typeof productDetails.inventory).toBe('object')
      expect(productDetails.inventory).toHaveProperty('inStock')
      expect(typeof productDetails.inventory.inStock).toBe('boolean')
      
      expect(productDetails).toHaveProperty('reviews')
      expect(Array.isArray(productDetails.reviews)).toBe(true)
    },
    AI_TEST_TIMEOUT
  )

  describe('error handling and edge cases', () => {
    it(
      'should handle schema validation errors gracefully',
      async () => {
        const testAI = AI({
          strictFunction: {
            id: 'string',
            count: 'number',
            active: 'boolean'
          }
        })

        const result = await testAI.strictFunction({
          invalidInput: 'test'
        })

        expect(result).toBeDefined()
        expect(typeof result).toBe('object')
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle provider failures with fallback responses',
      async () => {
        const testAI = AI({
          testFunction: { message: 'string' }
        })

        const result = await testAI.testFunction(
          { input: 'test' },
          { model: 'failing-provider' }
        )

        expect(result).toBeDefined()
        expect(result).toHaveProperty('message')
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle malformed JSON responses',
      async () => {
        const testAI = AI({
          jsonFunction: { 
            data: 'string',
            count: 'number'
          }
        })

        const result = await testAI.jsonFunction({
          prompt: 'Generate malformed JSON'
        })

        expect(result).toBeDefined()
        expect(typeof result).toBe('object')
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle empty and null inputs',
      async () => {
        const testAI = AI({
          nullTestFunction: { result: 'string' }
        })

        const result = await testAI.nullTestFunction(null)

        expect(result).toBeDefined()
        expect(result).toHaveProperty('result')
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle deeply nested schema validation',
      async () => {
        const testAI = AI({
          deepFunction: {
            level1: {
              level2: {
                level3: {
                  value: 'string',
                  count: 'number'
                }
              }
            }
          }
        })

        const result = await testAI.deepFunction({
          deep: 'nested input'
        })

        expect(result).toBeDefined()
        expect(result).toHaveProperty('level1')
        expect(typeof result.level1).toBe('object')
      },
      AI_TEST_TIMEOUT
    )

    it(
      'should handle array schema types',
      async () => {
        const testAI = AI({
          arrayFunction: {
            items: ['string'],
            metadata: {
              count: 'number',
              tags: ['string']
            }
          }
        })

        const result = await testAI.arrayFunction({
          generateList: true
        })

        expect(result).toBeDefined()
        expect(result).toHaveProperty('items')
        expect(Array.isArray(result.items)).toBe(true)
        expect(result).toHaveProperty('metadata')
        expect(result.metadata).toHaveProperty('tags')
      },
      AI_TEST_TIMEOUT
    )
  })
})
