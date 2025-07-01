import { model } from 'ai-providers'
import { z } from 'zod'
import { generateObject } from '../ai'
import { parseTemplate, createUnifiedFunction } from '../utils/template'

export interface TaskItem {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedHours?: number
  dependencies?: string[]
  assignee?: string
  dueDate?: string
  tags?: string[]
}

export interface TaskList {
  id: string
  title: string
  description?: string
  tasks: TaskItem[]
  metadata?: Record<string, any>
}

export interface PlanResult {
  title: string
  description: string
  taskLists: TaskList[]
  timeline?: {
    startDate: string
    endDate: string
    milestones: Array<{
      date: string
      title: string
      description?: string
    }>
  }
  resources?: Array<{
    type: 'human' | 'tool' | 'budget'
    name: string
    allocation?: string
  }>
}

const taskItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['pending', 'in-progress', 'completed', 'blocked']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  estimatedHours: z.number().optional(),
  dependencies: z.array(z.string()).optional(),
  assignee: z.string().optional(),
  dueDate: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

const taskListSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  tasks: z.array(taskItemSchema),
  metadata: z.record(z.any()).optional(),
})

const planSchema = z.object({
  title: z.string(),
  description: z.string(),
  taskLists: z.array(taskListSchema),
  timeline: z.object({
    startDate: z.string(),
    endDate: z.string(),
    milestones: z.array(z.object({
      date: z.string(),
      title: z.string(),
      description: z.string().optional(),
    })),
  }).optional(),
  resources: z.array(z.object({
    type: z.enum(['human', 'tool', 'budget']),
    name: z.string(),
    allocation: z.string().optional(),
  })).optional(),
})

interface PlanOptions {
  model?: string
  includeTimeline?: boolean
  includeResources?: boolean
  temperature?: number
  maxTokens?: number
}

const getAIProvider = (modelName: string | undefined) => {
  return model(modelName || 'gpt-4.1')
}

async function planCore(objective: string, options: PlanOptions = {}): Promise<PlanResult> {
  const aiModel = getAIProvider(options.model)

  const {
    includeTimeline = true,
    includeResources = true
  } = options

  let systemPrompt = 'You are an expert project planner. Create a detailed project plan with task lists and individual tasks.'
  
  if (includeTimeline) {
    systemPrompt += ' Include a realistic timeline with milestones.'
  }

  if (includeResources) {
    systemPrompt += ' Include resource allocation and requirements.'
  }

  const result = await generateObject({
    model: aiModel,
    system: systemPrompt,
    prompt: `Create a comprehensive project plan for: ${objective}`,
    schema: planSchema,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
  })
  
  return result.object
}

export function parseTaskLists(content: string): TaskList[] {
  const lines = content.split('\n')
  const taskLists: TaskList[] = []
  let currentList: TaskList | null = null
  let currentTask: TaskItem | null = null

  for (const line of lines) {
    const trimmed = line.trim()
    
    if (trimmed.startsWith('## ')) {
      if (currentList) {
        taskLists.push(currentList)
      }
      currentList = {
        id: Math.random().toString(36).substr(2, 9),
        title: trimmed.substring(3),
        tasks: []
      }
    } else if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
      if (currentList) {
        const isCompleted = trimmed.startsWith('- [x]')
        const title = trimmed.substring(5).trim()
        currentTask = {
          id: Math.random().toString(36).substr(2, 9),
          title,
          status: isCompleted ? 'completed' : 'pending',
          priority: 'medium'
        }
        currentList.tasks.push(currentTask)
      }
    }
  }

  if (currentList) {
    taskLists.push(currentList)
  }

  return taskLists
}

export function serializeTaskItem(task: TaskItem): string {
  const checkbox = task.status === 'completed' ? '[x]' : '[ ]'
  let line = `- ${checkbox} ${task.title}`
  
  if (task.priority && task.priority !== 'medium') {
    line += ` (${task.priority})`
  }
  
  if (task.estimatedHours) {
    line += ` [${task.estimatedHours}h]`
  }
  
  return line
}

export function serializeTaskList(taskList: TaskList): string {
  let content = `## ${taskList.title}\n\n`
  
  if (taskList.description) {
    content += `${taskList.description}\n\n`
  }
  
  for (const task of taskList.tasks) {
    content += serializeTaskItem(task) + '\n'
  }
  
  return content + '\n'
}

export function serializeTaskLists(taskLists: TaskList[]): string {
  return taskLists.map(serializeTaskList).join('')
}

export function serializePlanResult(plan: PlanResult): string {
  let content = `# ${plan.title}\n\n${plan.description}\n\n`
  
  content += serializeTaskLists(plan.taskLists)
  
  if (plan.timeline) {
    content += `## Timeline\n\n`
    content += `**Start:** ${plan.timeline.startDate}\n`
    content += `**End:** ${plan.timeline.endDate}\n\n`
    
    if (plan.timeline.milestones.length > 0) {
      content += `### Milestones\n\n`
      for (const milestone of plan.timeline.milestones) {
        content += `- **${milestone.date}:** ${milestone.title}`
        if (milestone.description) {
          content += ` - ${milestone.description}`
        }
        content += '\n'
      }
      content += '\n'
    }
  }
  
  if (plan.resources && plan.resources.length > 0) {
    content += `## Resources\n\n`
    for (const resource of plan.resources) {
      content += `- **${resource.name}** (${resource.type})`
      if (resource.allocation) {
        content += ` - ${resource.allocation}`
      }
      content += '\n'
    }
  }
  
  return content
}

export const plan = createUnifiedFunction<Promise<PlanResult>>(
  (objective: string, options: Record<string, any>) => {
    return planCore(objective, options as PlanOptions);
  }
);
