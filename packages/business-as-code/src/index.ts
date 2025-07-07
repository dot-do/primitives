import { Agent, Human, Workflow, AgentConfig, HumanConfig, workflowSchema } from './types'
import { BusinessConfig, BusinessInstance, PermissionLevel, Task, BusinessEvent } from './types'

export { Agent, Human, Workflow }
export type { BusinessConfig, BusinessInstance, PermissionLevel, Task, BusinessEvent, AgentConfig, HumanConfig }

/**
 * Creates a business representation for human-AI collaboration
 *
 * @param config The business configuration
 * @returns A business instance with methods for event handling, scheduling, and task management
 */
export function Business(config: BusinessConfig): BusinessInstance {
  const eventHandlers: Record<string, Function[]> = {}
  const scheduledOperations: Record<string, Function[]> = {}
  const cronJobs: Record<string, Function[]> = {}
  const tasks: Task[] = []
  const metrics: Record<string, any[]> = {}
  const integrations: Record<string, any> = {}

  const createAgent = (agentConfig: AgentConfig): Agent => ({
    config: agentConfig,
    execute: async (input: Record<string, any>, options?: any) => {
      return { result: 'Agent execution completed', input, options }
    },
    do: new Proxy({}, {
      get: (target, prop) => {
        return async (...args: any[]) => {
          return { action: prop, args, agent: agentConfig.name }
        }
      }
    })
  })

  const createHuman = (humanConfig: HumanConfig): Human => ({
    config: humanConfig,
    requestApproval: async (task: any) => {
      const taskRequest: any = {
        taskId: `approval_${Date.now()}`,
        status: 'pending' as const,
        approvalRequired: true,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
      return taskRequest
    },
    getResponse: async (taskId: string) => {
      return { taskId, response: 'Human response', timestamp: new Date() }
    },
    notify: async (message: string, platform = 'email' as const) => {
      console.log(`Notifying ${humanConfig.name} via ${platform}: ${message}`)
    }
  })

  const createWorkflow = (workflowConfig: any): Workflow => ({
    config: workflowConfig,
    execute: async (input: Record<string, any>) => {
      return { result: 'Workflow execution completed', input, workflow: workflowConfig.name }
    },
    getStatus: async () => 'completed' as const
  })

  const emitEvent = (event: string, data: any) => {
    if (eventHandlers[event]) {
      eventHandlers[event].forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    }
  }

  const business: BusinessInstance = {
    name: config.name,
    url: config.url,
    vision: config.vision,
    goals: config.goals,
    departments: config.departments,

    on: (event: string, handler: Function) => {
      if (!eventHandlers[event]) {
        eventHandlers[event] = []
      }
      eventHandlers[event].push(handler)
      return business
    },

    every: (schedule: string, operation: Function) => {
      if (!scheduledOperations[schedule]) {
        scheduledOperations[schedule] = []
      }
      scheduledOperations[schedule].push(operation)
      return business
    },

    assign: (taskTitle: string, to: Human | Agent) => {
      const task: Task = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: taskTitle,
        assignee: to,
        status: 'pending',
        timestamp: new Date(),
        priority: 'medium',
        requiredPermission: PermissionLevel.EXECUTE
      }

      tasks.push(task)

      if ('execute' in to && typeof to.execute === 'function') {
        task.status = 'in_progress'
        setTimeout(async () => {
          try {
            await to.execute({ task: taskTitle })
            task.status = 'completed'
            emitEvent('task_completed', { task, assignee: to })
          } catch (error) {
            task.status = 'blocked'
            emitEvent('task_failed', { task, assignee: to, error })
          }
        }, 100)
      } else if ('requestApproval' in to && typeof to.requestApproval === 'function') {
        emitEvent('task_assigned_to_human', { task, assignee: to })
      }

      emitEvent('task_created', { task, assignee: to })
      return task
    },

    track: (metric: string, value: any) => {
      if (!metrics[metric]) {
        metrics[metric] = []
      }

      metrics[metric].push({
        value,
        timestamp: new Date(),
      })

      emitEvent('metric_tracked', { metric, value })
      return business
    },

    emit: (event: string, data: any) => {
      emitEvent(event, data)
      return business
    },

    integrate: (systemName: string, config: any) => {
      integrations[systemName] = config
      emitEvent('system_integrated', { systemName, config })
      return business
    },

    schedule: (cronExpression: string, operation: Function) => {
      if (!cronJobs[cronExpression]) {
        cronJobs[cronExpression] = []
      }
      cronJobs[cronExpression].push(operation)
      emitEvent('job_scheduled', { cronExpression, operation: operation.name })
      return business
    },

    getMetrics: (metric?: string) => {
      if (metric) {
        return { [metric]: metrics[metric] || [] }
      }
      return metrics
    },

    getTasks: (status?: Task['status']) => {
      if (status) {
        return tasks.filter(task => task.status === status)
      }
      return tasks
    },

    approveTask: async (taskId: string, approver: Human) => {
      const task = tasks.find(t => t.id === taskId)
      if (!task) {
        throw new Error(`Task ${taskId} not found`)
      }

      if (!approver.config.permissions.includes(PermissionLevel.APPROVE)) {
        throw new Error(`${approver.config.name} does not have approval permissions`)
      }

      task.status = 'completed'
      emitEvent('task_approved', { task, approver })
      return task
    }
  }

  if (config.agents) {
    business.agents = {}
    Object.entries(config.agents).forEach(([key, agentConfig]) => {
      if (typeof agentConfig === 'object' && 'name' in agentConfig) {
        business.agents![key] = createAgent(agentConfig)
      }
    })
  }

  if (config.roles) {
    business.roles = {}
    Object.entries(config.roles).forEach(([key, humanConfig]) => {
      if (typeof humanConfig === 'object' && 'name' in humanConfig) {
        business.roles![key] = createHuman(humanConfig)
      }
    })
  }

  if (config.processes) {
    business.processes = {}
    Object.entries(config.processes).forEach(([key, workflowConfig]) => {
      if (typeof workflowConfig === 'object' && 'name' in workflowConfig) {
        business.processes![key] = createWorkflow(workflowConfig)
      }
    })
  }

  return business
}
