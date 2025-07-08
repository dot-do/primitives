import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AI } from './AI'
import { z } from 'zod'
import { clearResponseCache, setupAITestEnvironment, createCachedFunction } from './test-utils'

import { generateObject } from 'ai-functions'
import { model } from 'ai-providers'

const cachedGenerateObject = createCachedFunction(generateObject)

describe('AI Component', () => {
  beforeEach(() => {
    setupAITestEnvironment()
    clearResponseCache()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render without crashing', () => {
    expect(() => {
      render(
        <AI
          model='gpt-4o'
          schema={{
            title: 'string',
            content: 'string',
          }}
          prompt='Generate test content'
        >
          {() => <div>Content</div>}
        </AI>
      )
    }).not.toThrow()
  })

  describe('Basic Functionality', () => {
    it('should render with minimal required props', async () => {
      const schema = {
        title: 'string',
      }

      render(
        <AI
          model='gpt-4o'
          schema={schema}
          prompt='Generate a title for a test article'
        >
          {(props) => <h1 data-testid='title'>{props.title}</h1>}
        </AI>
      )

      await waitFor(() => {
        expect(screen.getByTestId('title')).toBeInTheDocument()
      }, { timeout: 30000 })

      const titleElement = screen.getByTestId('title')
      expect(titleElement.textContent).toBeTruthy()
      expect(typeof titleElement.textContent).toBe('string')
      expect(titleElement.textContent!.length).toBeGreaterThan(0)
    }, 30000)

    it('should render with all configuration options', async () => {
      render(
        <AI
          model='gpt-4o'
          schema={{
            title: 'string',
            content: 'string',
          }}
          prompt='Generate an article with title and content'
          stream={false}
          output='object'
          cols={1}
        >
          {(props, { isStreaming }) => (
            <div data-testid='content'>
              <h1>{props.title}</h1>
              <p>{props.content}</p>
              {isStreaming && <div>Loading...</div>}
            </div>
          )}
        </AI>
      )

      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument()
      }, { timeout: 30000 })

      const contentElement = screen.getByTestId('content')
      expect(contentElement).toBeInTheDocument()
      expect(contentElement.querySelector('h1')).toBeTruthy()
      expect(contentElement.querySelector('p')).toBeTruthy()
    }, 30000)
  })

  describe('Schema Handling', () => {
    it('should work with simple object schema', async () => {
      render(
        <AI
          model='gpt-4o'
          schema={{
            title: 'string',
            views: 'number',
            isPublished: 'boolean',
          }}
          prompt='Generate metadata for a blog article with title, view count, and publication status'
        >
          {(props) => (
            <div data-testid='metadata'>
              <h1>{props.title}</h1>
              <p>Views: {props.views}</p>
              <p>Published: {props.isPublished ? 'Yes' : 'No'}</p>
            </div>
          )}
        </AI>
      )

      await waitFor(() => {
        expect(screen.getByTestId('metadata')).toBeInTheDocument()
      }, { timeout: 30000 })

      const metadataElement = screen.getByTestId('metadata')
      expect(metadataElement.querySelector('h1')).toBeTruthy()
      expect(metadataElement.textContent).toMatch(/Views: \d+/)
      expect(metadataElement.textContent).toMatch(/Published: (Yes|No)/)
    }, 30000)

    it('should work with Zod schema', async () => {
      const ArticleSchema = z.object({
        title: z.string(),
        content: z.string(),
        wordCount: z.number(),
      })

      render(
        <AI model='gpt-4o' schema={ArticleSchema} prompt='Generate a short article with title, content, and word count'>
          {(props) => (
            <div data-testid='article'>
              <h1>{props.title}</h1>
              <p>{props.content}</p>
              <span>Word count: {props.wordCount}</span>
            </div>
          )}
        </AI>
      )

      await waitFor(() => {
        expect(screen.getByTestId('article')).toBeInTheDocument()
      }, { timeout: 30000 })

      const articleElement = screen.getByTestId('article')
      expect(articleElement.querySelector('h1')).toBeTruthy()
      expect(articleElement.querySelector('p')).toBeTruthy()
      expect(articleElement.textContent).toMatch(/Word count: \d+/)
    }, 30000)

    it('should handle pipe-separated enum values', async () => {
      render(
        <AI
          model='gpt-4o'
          schema={{
            category: 'Technology | Business | Science | Health',
          }}
          prompt='Choose one category from the available options for a tech startup'
        >
          {(props) => <div data-testid='category'>{props.category}</div>}
        </AI>
      )

      await waitFor(() => {
        expect(screen.getByTestId('category')).toBeInTheDocument()
        const category = screen.getByTestId('category').textContent
        expect(['Technology', 'Business', 'Science', 'Health']).toContain(category)
      }, { timeout: 30000 })
    }, 30000)
  })

  describe('Output Formats', () => {
    it('should handle object output format', async () => {
      render(
        <AI
          model='gpt-4o'
          schema={{
            title: 'string',
            content: 'string',
          }}
          prompt='Generate a brief article with title and content'
          output='object'
        >
          {(props) => (
            <div data-testid='article'>
              <h1>{props.title}</h1>
              <p>{props.content}</p>
            </div>
          )}
        </AI>
      )

      await waitFor(() => {
        expect(screen.getByTestId('article')).toBeInTheDocument()
      }, { timeout: 30000 })

      const articleElement = screen.getByTestId('article')
      expect(articleElement.querySelector('h1')).toBeTruthy()
      expect(articleElement.querySelector('p')).toBeTruthy()
    }, 30000)

    it('should handle array output with grid layout', async () => {
      render(
        <AI
          model='gpt-4o'
          schema={{
            title: 'string',
            description: 'string',
          }}
          prompt='Generate a list of 3 programming tools with titles and descriptions'
          output='array'
          cols={3}
        >
          {(props) => (
            <div data-testid='item'>
              <h3>{props.title}</h3>
              <p>{props.description}</p>
            </div>
          )}
        </AI>
      )

      await waitFor(() => {
        const items = screen.getAllByTestId('item')
        expect(items.length).toBeGreaterThan(0)
        expect(items.length).toBeLessThanOrEqual(5)
        items.forEach(item => {
          expect(item.querySelector('h3')).toBeTruthy()
          expect(item.querySelector('p')).toBeTruthy()
        })
      }, { timeout: 30000 })
    }, 30000)
  })

  describe('Error Handling', () => {
    it('should handle schema validation errors', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <AI
          model='invalid-model-that-does-not-exist'
          schema={z.object({
            title: z.string(),
            content: z.string(),
          })}
          prompt='Generate content with invalid model'
        >
          {(props, { error }) => (
            <div>
              {error ? (
                <div data-testid='error'>Error: {error.message}</div>
              ) : (
                <div>
                  <h1>{props.title}</h1>
                  <p>{props.content}</p>
                </div>
              )}
            </div>
          )}
        </AI>
      )

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument()
      }, { timeout: 30000 })
    }, 30000)

    it('should handle API failures', async () => {
      render(
        <AI
          model='non-existent-model'
          schema={{
            title: 'string',
            content: 'string',
          }}
          prompt='Generate content with non-existent model'
        >
          {(props, { error }) => (
            <div>
              {error ? (
                <div data-testid='api-error'>Error: {error.message}</div>
              ) : (
                <div>
                  <h1>{props.title}</h1>
                  <p>{props.content}</p>
                </div>
              )}
            </div>
          )}
        </AI>
      )

      await waitFor(() => {
        expect(screen.getByTestId('api-error')).toBeInTheDocument()
      }, { timeout: 30000 })
    }, 30000)

    it('should handle malformed responses', async () => {
      render(
        <AI
          model='invalid-model-format'
          schema={{
            title: 'string',
            content: 'string',
          }}
          prompt='Generate content with invalid model format'
        >
          {(props, { error }) => (
            <div>
              {error ? (
                <div data-testid='malformed-error'>Error: {error.message}</div>
              ) : (
                <div>
                  <h1>{props.title}</h1>
                  <p>{props.content}</p>
                </div>
              )}
            </div>
          )}
        </AI>
      )

      await waitFor(() => {
        expect(screen.getByTestId('malformed-error')).toBeInTheDocument()
      }, { timeout: 30000 })
    }, 30000)
  })

  describe('Streaming Mode', () => {
    it('should set isStreaming state during API call', async () => {
      let streamingState = false

      render(
        <AI
          model='gpt-4o'
          schema={{
            title: 'string',
            content: 'string',
          }}
          prompt='Generate content for streaming test'
          stream={true}
        >
          {(props, { isStreaming }) => {
            streamingState = isStreaming
            return <div data-testid='streaming'>{isStreaming ? 'Loading...' : props.title || 'No title'}</div>
          }}
        </AI>
      )

      await waitFor(() => {
        expect(screen.getByTestId('streaming')).toBeInTheDocument()
      }, { timeout: 30000 })

      await waitFor(() => {
        expect(screen.getByTestId('streaming')).not.toHaveTextContent('Loading...')
      }, { timeout: 30000 })
    }, 30000)
  })

  describe('Edge Cases', () => {
    it('should handle empty results', async () => {
      render(
        <AI
          model='gpt-4o'
          schema={{
            title: 'string',
            content: 'string',
          }}
          prompt='Generate minimal content with just basic structure'
        >
          {(props) => (
            <div data-testid='empty'>
              <h1>{props.title || 'No Title'}</h1>
              <p>{props.content || 'No Content'}</p>
            </div>
          )}
        </AI>
      )

      await waitFor(() => {
        expect(screen.getByTestId('empty')).toBeInTheDocument()
      }, { timeout: 30000 })

      const emptyElement = screen.getByTestId('empty')
      expect(emptyElement.querySelector('h1')).toBeTruthy()
      expect(emptyElement.querySelector('p')).toBeTruthy()
    }, 30000)

    it('should handle invalid inputs', async () => {
      render(
        <AI
          model='invalid-model'
          schema={{
            title: 'string',
          }}
          prompt='Generate with invalid model'
        >
          {(props, { error }) => <div data-testid='invalid-input'>{error ? `Error: ${error.message}` : props.title}</div>}
        </AI>
      )

      await waitFor(() => {
        expect(screen.getByTestId('invalid-input')).toBeInTheDocument()
      })
    })
  })
})
