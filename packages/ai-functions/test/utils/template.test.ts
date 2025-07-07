import { describe, it, expect } from 'vitest'
import { stringifyValue, parseTemplate, createUnifiedFunction } from '../../src/utils/template'

describe('template utility', () => {
  describe('stringifyValue', () => {
    it('should handle simple strings', () => {
      const result = stringifyValue('test string')
      expect(result).toBe('test string')
    })

    it('should handle numbers', () => {
      const result = stringifyValue(42)
      expect(result).toBe('42')
    })

    it('should handle booleans', () => {
      expect(stringifyValue(true)).toBe('true')
      expect(stringifyValue(false)).toBe('false')
    })

    it('should handle complex objects with YAML', () => {
      const obj = { nested: { array: [1, 2, 3] } }
      const result = stringifyValue(obj)
      
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
      expect(result).toContain('nested')
    })

    it('should handle arrays', () => {
      const arr = ['item1', 'item2', 'item3']
      const result = stringifyValue(arr)
      
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle null and undefined values', () => {
      expect(stringifyValue(null)).toBe('null')
      expect(stringifyValue(undefined)).toBe('undefined')
    })

    it('should handle empty objects', () => {
      const result = stringifyValue({})
      expect(typeof result).toBe('string')
    })

    it('should handle empty arrays', () => {
      const result = stringifyValue([])
      expect(typeof result).toBe('string')
    })
  })

  describe('parseTemplate', () => {
    it('should parse template with single value', () => {
      const template = Object.assign(['Hello ', ''], { raw: ['Hello ', ''] }) as TemplateStringsArray
      const values = ['world']
      
      const result = parseTemplate(template, values)
      expect(result).toBe('Hello world')
    })

    it('should parse template with multiple values', () => {
      const template = Object.assign(['Hello ', ' from ', ''], { raw: ['Hello ', ' from ', ''] }) as TemplateStringsArray
      const values = ['world', 'test']
      
      const result = parseTemplate(template, values)
      expect(result).toBe('Hello world from test')
    })

    it('should handle template with no values', () => {
      const template = Object.assign(['Hello world'], { raw: ['Hello world'] }) as TemplateStringsArray
      const values: any[] = []
      
      const result = parseTemplate(template, values)
      expect(result).toBe('Hello world')
    })

    it('should handle complex object values', () => {
      const template = Object.assign(['Data: ', ''], { raw: ['Data: ', ''] }) as TemplateStringsArray
      const values = [{ name: 'test', count: 42 }]
      
      const result = parseTemplate(template, values)
      expect(result).toContain('Data:')
      expect(result).toContain('name')
    })

    it('should handle array values', () => {
      const template = Object.assign(['Items: ', ''], { raw: ['Items: ', ''] }) as TemplateStringsArray
      const values = [['item1', 'item2']]
      
      const result = parseTemplate(template, values)
      expect(result).toContain('Items:')
      expect(result).toContain('item1')
    })
  })

  describe('createUnifiedFunction', () => {
    it('should throw error for no arguments', () => {
      const fn = createUnifiedFunction(() => 'test')
      
      expect(() => fn()).toThrow('Function must be called as a template literal or with string and options')
    })

    it('should throw error for undefined arguments', () => {
      const fn = createUnifiedFunction(() => 'test')
      
      expect(() => fn(undefined)).toThrow('Function must be called as a template literal or with string and options')
    })

    it('should handle string and options correctly', () => {
      const fn = createUnifiedFunction((template, options) => ({ template, options }))
      
      const result = fn('test template', { option: 'value' })
      expect(result.template).toBe('test template')
      expect(result.options.option).toBe('value')
    })

    it('should handle template literal syntax', () => {
      const fn = createUnifiedFunction((template, options) => ({ template, options }))
      
      const template = Object.assign(['Hello ', ''], { raw: ['Hello ', ''] }) as TemplateStringsArray
      const result = fn(template, 'world')
      
      expect(result.template).toBe('Hello world')
      expect(result.options).toEqual({})
    })

    it('should handle proxy get method for template literals', () => {
      const fn = createUnifiedFunction((template, options) => template)
      
      const template = Object.assign(['Test ', ''], { raw: ['Test ', ''] }) as TemplateStringsArray
      const proxiedFn = fn.someMethod(template, 'value')
      
      expect(typeof proxiedFn).toBe('function')
    })

    it('should throw error for non-async iterable results', () => {
      const fn = createUnifiedFunction(() => ({ notIterable: true }))
      const template = Object.assign(['test'], { raw: ['test'] }) as TemplateStringsArray
      const proxied = fn.test(template)
      
      expect(() => proxied[Symbol.asyncIterator]()).toThrow('Result is not async iterable')
    })

    it('should handle async iterable results', () => {
      const mockAsyncIterable = {
        [Symbol.asyncIterator]: () => ({
          next: () => Promise.resolve({ value: 'test', done: true })
        })
      }
      
      const fn = createUnifiedFunction(() => mockAsyncIterable)
      const template = Object.assign(['test'], { raw: ['test'] }) as TemplateStringsArray
      const proxied = fn.test(template)
      
      expect(() => proxied[Symbol.asyncIterator]()).not.toThrow()
    })

    it('should handle proxy apply method errors', () => {
      const fn = createUnifiedFunction(() => 'test')
      
      expect(() => fn.apply(null, [])).toThrow('Function must be called as a template literal or with string and options')
    })

    it('should handle invalid template literal usage in proxy get', () => {
      const fn = createUnifiedFunction(() => 'test')
      
      expect(() => fn.method('not a template')).toThrow('Function must be called as a template literal or with string and options')
    })

    it('should return undefined for promise methods', () => {
      const fn = createUnifiedFunction(() => 'test')
      
      expect(fn.then).toBeUndefined()
      expect(fn.catch).toBeUndefined()
      expect(fn.finally).toBeUndefined()
    })
  })
})
