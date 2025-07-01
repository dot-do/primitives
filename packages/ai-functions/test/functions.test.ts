import { describe, it, expect } from 'vitest'
import { 
  ai, 
  list, 
  extract, 
  is, 
  say, 
  image, 
  markdown, 
  video, 
  code, 
  mdx, 
  plan, 
  scope, 
  ui, 
  workflow, 
  prompt, 
  research, 
  scrape 
} from '../src/index'

describe('ai-functions migrated from mdx', () => {
  it('should export ai function', () => {
    expect(typeof ai).toBe('function')
  })

  it('should export list function', () => {
    expect(typeof list).toBe('function')
  })

  it('should export extract function', () => {
    expect(typeof extract).toBe('function')
  })

  it('should export is function', () => {
    expect(typeof is).toBe('function')
  })

  it('should export say function', () => {
    expect(typeof say).toBe('function')
  })

  it('should export image function', () => {
    expect(typeof image).toBe('function')
  })

  it('should export markdown function', () => {
    expect(typeof markdown).toBe('function')
  })

  it('should export video function', () => {
    expect(typeof video).toBe('function')
  })

  it('should export code function', () => {
    expect(typeof code).toBe('function')
  })

  it('should export mdx function', () => {
    expect(typeof mdx).toBe('function')
  })

  it('should export plan function', () => {
    expect(typeof plan).toBe('function')
  })

  it('should export scope function', () => {
    expect(typeof scope).toBe('function')
  })

  it('should export ui function', () => {
    expect(typeof ui).toBe('function')
  })

  it('should export workflow function', () => {
    expect(typeof workflow).toBe('function')
  })

  it('should export prompt function', () => {
    expect(typeof prompt).toBe('function')
  })

  it('should export research function', () => {
    expect(typeof research).toBe('function')
  })

  it('should export scrape function', () => {
    expect(typeof scrape).toBe('function')
  })
})
