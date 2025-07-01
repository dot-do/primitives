export { ai, generateObject } from './ai'
export { AI } from './ai-factory'
export { list } from './list'
export * from './types'

export { extract } from './functions/extract'
export { is } from './functions/is'
export { say, type SayTemplateFn } from './functions/say'
export { image, type ImageTemplateFn } from './functions/image'
export { markdown, type MarkdownTemplateFn, type MarkdownResult } from './functions/markdown'
export { video, type VideoConfig, type VideoResult } from './functions/video'
export { code } from './functions/code'
export { mdx } from './functions/mdx'
export { 
  plan, 
  parseTaskLists, 
  serializeTaskItem, 
  serializeTaskList, 
  serializeTaskLists, 
  serializePlanResult,
  type TaskItem, 
  type TaskList, 
  type PlanResult 
} from './functions/plan'
export { scope } from './functions/scope'
export { ui } from './functions/ui'
export { workflow } from './functions/workflow'
export { prompt, type PromptTemplateFn, type PromptResult, type PromptOptions } from './functions/prompt'
export { research, type ResearchResult } from './functions/research'
export { scrape, scrapeMultiple, type ScrapedContent } from './functions/scrape'

export { parseTemplate, stringifyValue, type TemplateFunction, createUnifiedFunction } from './utils/template'
export { createZodSchemaFromObject, inferAndValidateOutput } from './utils/ai-execution'
export { handleStringOutput, handleArrayOutput, handleObjectOutput } from './utils/output-handlers'
