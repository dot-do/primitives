import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Model, createModel } from '../src/index.js'

function setupTestEnvironment() {
  if (!process.env.AI_GATEWAY_URL) {
    process.env.AI_GATEWAY_URL = 'https://api.llm.do'
  }
  if (!process.env.AI_GATEWAY_TOKEN) {
    process.env.AI_GATEWAY_TOKEN = process.env.OPENAI_API_KEY || 'test-token'
  }
}

describe('language-models', () => {
  beforeEach(() => {
    setupTestEnvironment()
  })

  it('should export Model type', () => {
    const testType = (model: Model) => model
    expect(typeof testType).toBe('function')
  })

  describe('createModel', () => {
    it('should throw error for invalid model', () => {
      expect(() => createModel({
        provider: 'invalid',
        modelName: 'invalid-model'
      })).toThrow('Model invalid/invalid-model not found')
    })

    it('should validate model existence before creating', () => {
      expect(() => createModel({
        provider: 'nonexistent',
        modelName: 'fake-model'
      })).toThrow('Model nonexistent/fake-model not found')
    })
  })
})
