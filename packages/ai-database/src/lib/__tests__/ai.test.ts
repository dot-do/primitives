import { expect, describe, it, beforeEach, vi } from 'vitest'
import { ai, AI } from '../ai'
import { DB } from '../db'
import { db } from '../../databases/sqlite'

function setupTestEnvironment() {
  if (!process.env.AI_GATEWAY_URL) {
    process.env.AI_GATEWAY_URL = 'https://api.llm.do'
  }
  if (!process.env.AI_GATEWAY_TOKEN) {
    process.env.AI_GATEWAY_TOKEN = process.env.OPENAI_API_KEY || 'test-token'
  }
}

vi.mock('@payload-config', () => ({
  default: {}
}))


vi.mock('payload', () => ({
  getPayload: vi.fn().mockResolvedValue({
    findGlobal: vi.fn().mockResolvedValue({})
  })
}))

vi.mock('react', () => ({
  cache: (fn: any) => fn
}))

vi.mock('graphql', () => ({
  StringValueNode: vi.fn()
}))


vi.mock('../../databases/sqlite', () => ({
  db: {
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    getOrCreate: vi.fn(),
    find: vi.fn(),
    delete: vi.fn()
  }
}))

describe('Enhanced AI functions', () => {
  beforeEach(() => {
    setupTestEnvironment()
    vi.resetAllMocks && vi.resetAllMocks()
    
    const mockedDb = db as any
    mockedDb.findOne.mockResolvedValue(null)
    mockedDb.create.mockImplementation((params: any) => Promise.resolve({
      id: 'mock-id',
      ...params.data
    }))
    mockedDb.update.mockImplementation((params: any) => Promise.resolve({
      id: params.id,
      ...params.data
    }))
    mockedDb.getOrCreate.mockImplementation((params: any) => Promise.resolve({
      id: 'mock-id',
      ...params.data
    }))
  })

  describe('ai function', () => {
    it('should check for function existence and create if not found', async () => {
      const result = await ai('Generate a simple test response', { function: 'testFunction' })
      
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      
      expect((db as any).findOne).toHaveBeenCalledWith({
        collection: 'functions',
        where: { name: { equals: 'testFunction' } }
      })
      
      expect((db as any).create).toHaveBeenCalledWith(expect.objectContaining({
        collection: 'functions',
        data: expect.objectContaining({
          name: 'testFunction'
        })
      }))
    }, 30000)

    it('should store event and generation records', async () => {
      const result = await ai('Generate a test response for database tracking')
      
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      
      expect((db as any).create).toHaveBeenCalledWith(expect.objectContaining({
        collection: 'events'
      }))
      
      expect((db as any).create).toHaveBeenCalledWith(expect.objectContaining({
        collection: 'generations'
      }))
    }, 30000)
  })

  describe('AI function', () => {
    it('should handle workflow definitions with direct functions', async () => {
      const testFunction = () => { return "test" }
      
      AI({
        testWorkflow: testFunction
      })
      
      expect((db as any).getOrCreate).toHaveBeenCalledWith(expect.objectContaining({
        collection: 'workflows',
        data: expect.objectContaining({
          name: 'testWorkflow',
          code: testFunction.toString()
        })
      }))
    })
  })

  describe('DB function', () => {
    it('should create methods for interacting with nouns', async () => {
      const User = DB({
        id: 'User',
        context: 'User definition'
      })
      
      expect((db as any).getOrCreate).toHaveBeenCalledWith(expect.objectContaining({
        collection: 'nouns',
        data: expect.objectContaining({
          id: 'User'
        })
      }))
      
      expect(User).toHaveProperty('create')
      expect(User).toHaveProperty('find')
      expect(User).toHaveProperty('findOne')
      expect(User).toHaveProperty('update')
      expect(User).toHaveProperty('delete')
    })
  })
})
