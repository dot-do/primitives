import { describe, it, expect, vi } from 'vitest'
import { Model, createModel } from '../src/index.js'

vi.mock('ai-providers', () => ({
  languageModel: vi.fn((modelId: string) => ({
    complete: vi.fn().mockResolvedValue({ text: 'mocked response' }),
    streamComplete: vi.fn().mockResolvedValue({}),
    generate: vi.fn().mockResolvedValue({ text: 'mocked response' }),
    stream: vi.fn().mockResolvedValue({})
  }))
}))

describe('language-models', () => {
  it('should export Model type', () => {
    const testType = (model: Model) => model
    expect(typeof testType).toBe('function')
  })

  describe('createModel', () => {
    it('should create model with valid provider and model', () => {
      const model = createModel({
        provider: 'openai',
        modelName: 'gpt-4o',
        apiKey: 'test-key'
      })
      
      expect(model).toBeDefined()
      expect(model.complete).toBeDefined()
      expect(model.streamComplete).toBeDefined()
      expect(model.generate).toBeDefined()
      expect(model.stream).toBeDefined()
    })

    it('should throw error for invalid model', () => {
      expect(() => createModel({
        provider: 'invalid',
        modelName: 'invalid-model'
      })).toThrow('Model invalid/invalid-model not found')
    })

    it('should work with test models', () => {
      const model = createModel({
        provider: 'test',
        modelName: 'model-1'
      })
      
      expect(model).toBeDefined()
    })

    it('should work with anthropic models', () => {
      const model = createModel({
        provider: 'anthropic',
        modelName: 'claude-3.5-sonnet',
        apiKey: 'test-key'
      })
      
      expect(model).toBeDefined()
    })

    it('should work with google models', () => {
      const model = createModel({
        provider: 'google',
        modelName: 'gemini-2.0-flash-001',
        apiKey: 'test-key'
      })
      
      expect(model).toBeDefined()
    })

    it('should work without apiKey parameter', () => {
      const model = createModel({
        provider: 'test',
        modelName: 'model-0'
      })
      
      expect(model).toBeDefined()
    })
  })
})
