import { describe, it, expect } from 'vitest'
import { createZodSchemaFromObject, inferAndValidateOutput } from '../../src/utils/ai-execution'
import { z } from 'zod'

describe('ai-execution utility', () => {
  describe('createZodSchemaFromObject', () => {
    it('should create schema for simple string fields', () => {
      const obj = { name: 'string description' }
      const schema = createZodSchemaFromObject(obj)
      
      expect(schema).toBeDefined()
      expect(() => schema.parse({ name: 'test' })).not.toThrow()
    })

    it('should handle enum fields with pipe separator', () => {
      const obj = { status: 'active|inactive|pending' }
      const schema = createZodSchemaFromObject(obj)
      
      expect(schema).toBeDefined()
      expect(() => schema.parse({ status: 'active' })).not.toThrow()
      expect(() => schema.parse({ status: 'invalid' })).toThrow()
    })

    it('should handle array fields', () => {
      const obj = { tags: ['string'] }
      const schema = createZodSchemaFromObject(obj)
      
      expect(schema).toBeDefined()
      expect(() => schema.parse({ tags: ['tag1', 'tag2'] })).not.toThrow()
    })

    it('should handle nested objects', () => {
      const obj = { user: { name: 'string', age: 'number' } }
      const schema = createZodSchemaFromObject(obj)
      
      expect(schema).toBeDefined()
      expect(() => schema.parse({ user: { name: 'test', age: '25' } })).not.toThrow()
    })

    it('should handle mixed type objects', () => {
      const obj = { 
        id: 'string',
        count: 42,
        active: true,
        tags: ['item1', 'item2']
      }
      const schema = createZodSchemaFromObject(obj)
      
      expect(schema).toBeDefined()
      expect(() => schema.parse({ 
        id: 'test', 
        count: 'string representation',
        active: 'true',
        tags: ['tag1']
      })).not.toThrow()
    })

    it('should handle empty objects', () => {
      const obj = {}
      const schema = createZodSchemaFromObject(obj)
      
      expect(schema).toBeDefined()
      expect(() => schema.parse({})).not.toThrow()
    })
  })

  describe('inferAndValidateOutput', () => {
    it('should return result unchanged when no schema provided', () => {
      const result = { test: 'data' }
      const output = inferAndValidateOutput(null, result)
      
      expect(output).toBe(result)
    })

    it('should return result unchanged when undefined schema provided', () => {
      const result = { test: 'data' }
      const output = inferAndValidateOutput(undefined, result)
      
      expect(output).toBe(result)
    })

    it('should validate against object schema', () => {
      const schema = { name: 'string', age: 'number' }
      const result = { name: 'John', age: '30' }
      
      const output = inferAndValidateOutput(schema, result)
      expect(output).toBeDefined()
    })

    it('should handle validation failures gracefully', () => {
      const schema = { required: 'string' }
      const result = { wrong: 'field' }
      
      const output = inferAndValidateOutput(schema, result)
      expect(output).toBe(result)
    })

    it('should handle array schemas', () => {
      const schema = ['string']
      const result = ['item1', 'item2']
      
      const output = inferAndValidateOutput(schema, result)
      expect(output).toBe(result)
    })

    it('should handle complex nested validation', () => {
      const schema = {
        user: {
          profile: {
            name: 'string',
            settings: {
              theme: 'light|dark'
            }
          }
        }
      }
      const result = {
        user: {
          profile: {
            name: 'Test User',
            settings: {
              theme: 'light'
            }
          }
        }
      }
      
      const output = inferAndValidateOutput(schema, result)
      expect(output).toBeDefined()
    })
  })
})
