import { z } from 'zod'

export interface AgentConfig {
  name: string
  url?: string
  role: string
  objective: string
  keyResults: string[]
  integrations?: string[]
  triggers?: string[]
  searches?: string[]
  actions?: string[]
  [key: string]: any
}

export interface Agent {
  config: AgentConfig
  execute: (input: Record<string, any>, options?: any) => Promise<any>
  do: any
  [key: string]: any
}

export type HumanPlatform = 'slack' | 'teams' | 'react' | 'email'
export type HumanTaskStatus = 'pending' | 'completed' | 'timeout'

export interface HumanConfig {
  name: string
  email?: string
  role: string
  permissions: PermissionLevel[]
  platforms?: HumanPlatform[]
  [key: string]: any
}

export interface HumanTaskRequest {
  taskId: string
  status: HumanTaskStatus
  messageId?: Record<HumanPlatform, string>
  approvalRequired?: boolean
  deadline?: Date
}

export interface Human {
  config: HumanConfig
  requestApproval: (task: any) => Promise<HumanTaskRequest>
  getResponse: (taskId: string) => Promise<any>
  notify: (message: string, platform?: HumanPlatform) => Promise<void>
  [key: string]: any
}

export const workflowStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['manual', 'automated', 'approval', 'condition']),
  inputs: z.array(z.string()),
  outputs: z.array(z.string()),
  conditions: z.array(z.string()).optional(),
  estimatedDuration: z.string().optional(),
  assignee: z.string().optional(),
})

export const workflowSchema = z.object({
  name: z.string(),
  description: z.string(),
  steps: z.array(workflowStepSchema),
  triggers: z.array(z.string()),
  outcomes: z.array(z.string()),
})

export interface Workflow {
  config: z.infer<typeof workflowSchema>
  execute: (input: Record<string, any>) => Promise<any>
  getStatus: () => Promise<'pending' | 'running' | 'completed' | 'failed'>
  [key: string]: any
}

/**
 * Business configuration interface
 */
export interface BusinessConfig {
  name: string
  url?: string
  vision?: string
  goals?: Array<{
    objective: string
    keyResults?: string[]
  }>
  roles?: Record<string, HumanConfig>
  agents?: Record<string, AgentConfig>
  departments?: Record<
    string,
    {
      name: string
      lead: HumanConfig | AgentConfig
      members?: Array<HumanConfig | AgentConfig>
    }
  >
  processes?: Record<string, z.infer<typeof workflowSchema>>
}

/**
 * Business instance returned by the Business function
 */
export interface BusinessInstance {
  name: string
  url?: string
  vision?: string
  goals?: Array<{
    objective: string
    keyResults?: string[]
  }>
  departments?: Record<
    string,
    {
      name: string
      lead: HumanConfig | AgentConfig
      members?: Array<HumanConfig | AgentConfig>
    }
  >
  
  roles?: Record<string, Human>
  agents?: Record<string, Agent>
  processes?: Record<string, Workflow>

  on: (event: string, handler: Function) => BusinessInstance

  every: (schedule: string, operation: Function) => BusinessInstance

  assign: (task: string, to: Human | Agent) => Task

  track: (metric: string, value: any) => BusinessInstance
  
  emit: (event: string, data: any) => BusinessInstance
  
  integrate: (systemName: string, config: any) => BusinessInstance
  
  schedule: (cronExpression: string, operation: Function) => BusinessInstance
  
  getMetrics: (metric?: string) => Record<string, any[]>
  
  getTasks: (status?: Task['status']) => Task[]
  
  approveTask: (taskId: string, approver: Human) => Promise<Task>
}

/**
 * Permission level enum for human-AI collaboration
 */
export enum PermissionLevel {
  VIEW = 'view',
  SUGGEST = 'suggest',
  EXECUTE = 'execute',
  APPROVE = 'approve',
  ADMIN = 'admin',
}

/**
 * Task assignment interface
 */
export interface Task {
  id: string
  title: string
  description?: string
  assignee?: Human | Agent
  dueDate?: Date
  status?: 'pending' | 'in_progress' | 'completed' | 'blocked'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  requiredPermission?: PermissionLevel
  dependencies?: string[]
  timestamp?: Date
}

/**
 * Event interface for business events
 */
export interface BusinessEvent {
  type: string
  data: any
  source?: string
  timestamp: Date
  requiredApproval?: Human[]
}
