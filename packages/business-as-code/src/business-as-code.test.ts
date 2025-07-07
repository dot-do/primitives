import { describe, it, expect, beforeEach } from 'vitest'
import { Business } from './index'
import { PermissionLevel } from './types'
import type { BusinessConfig, Agent, Human, Workflow } from './types'

describe('Business function', () => {
  let businessConfig: BusinessConfig
  
  beforeEach(() => {
    businessConfig = {
      name: 'Test Company',
      url: 'https://test.com',
      vision: 'To test business-as-code functionality',
      goals: [
        {
          objective: 'Implement comprehensive testing',
          keyResults: ['100% test coverage', 'All tests passing', 'Documentation complete']
        }
      ],
      roles: {
        ceo: {
          name: 'Test CEO',
          email: 'ceo@test.com',
          role: 'Chief Executive Officer',
          permissions: [PermissionLevel.ADMIN, PermissionLevel.APPROVE]
        },
        manager: {
          name: 'Test Manager',
          email: 'manager@test.com',
          role: 'Project Manager',
          permissions: [PermissionLevel.EXECUTE, PermissionLevel.APPROVE]
        }
      },
      agents: {
        dataAnalyst: {
          name: 'Data Analysis Agent',
          role: 'Data Analyst',
          objective: 'Analyze business data',
          keyResults: ['Generate insights', 'Create reports']
        },
        customerSupport: {
          name: 'Customer Support Agent',
          role: 'Customer Support',
          objective: 'Handle customer inquiries',
          keyResults: ['Resolve tickets', 'Maintain satisfaction']
        }
      },
      departments: {
        engineering: {
          name: 'Engineering Department',
          lead: {
            name: 'Tech Lead',
            email: 'lead@test.com',
            role: 'Technical Lead',
            permissions: [PermissionLevel.EXECUTE, PermissionLevel.APPROVE]
          },
          members: []
        }
      },
      processes: {
        customerOnboarding: {
          name: 'Customer Onboarding',
          description: 'Process for onboarding new customers',
          steps: [
            {
              id: 'step1',
              name: 'Welcome Email',
              description: 'Send welcome email to new customer',
              type: 'automated',
              inputs: ['customer_email'],
              outputs: ['email_sent']
            }
          ],
          triggers: ['new_customer'],
          outcomes: ['customer_onboarded']
        }
      }
    }
  })

  describe('Business creation', () => {
    it('should create a business instance with basic configuration', () => {
      const business = Business(businessConfig)

      expect(business).toBeDefined()
      expect(business.name).toBe('Test Company')
      expect(business.url).toBe('https://test.com')
      expect(business.vision).toBe('To test business-as-code functionality')
      expect(business.goals).toHaveLength(1)
      expect(business.goals![0].objective).toBe('Implement comprehensive testing')
    })

    it('should initialize agents from configuration', () => {
      const business = Business(businessConfig)

      expect(business.agents).toBeDefined()
      expect(business.agents!.dataAnalyst).toBeDefined()
      expect(business.agents!.dataAnalyst.config.name).toBe('Data Analysis Agent')
      expect(business.agents!.customerSupport).toBeDefined()
      expect(business.agents!.customerSupport.config.name).toBe('Customer Support Agent')
    })

    it('should initialize humans from configuration', () => {
      const business = Business(businessConfig)

      expect(business.roles).toBeDefined()
      expect(business.roles!.ceo).toBeDefined()
      expect(business.roles!.ceo.config.name).toBe('Test CEO')
      expect(business.roles!.manager).toBeDefined()
      expect(business.roles!.manager.config.name).toBe('Test Manager')
    })

    it('should initialize workflows from configuration', () => {
      const business = Business(businessConfig)

      expect(business.processes).toBeDefined()
      expect(business.processes!.customerOnboarding).toBeDefined()
      expect(business.processes!.customerOnboarding.config.name).toBe('Customer Onboarding')
    })
  })

  describe('Event handling', () => {
    it('should register and trigger event handlers', () => {
      const business = Business(businessConfig)
      let eventTriggered = false
      let eventData: any = null

      business.on('test_event', (data: any) => {
        eventTriggered = true
        eventData = data
      })

      business.emit('test_event', { message: 'Hello World' })

      expect(eventTriggered).toBe(true)
      expect(eventData).toEqual({ message: 'Hello World' })
    })

    it('should support multiple handlers for the same event', () => {
      const business = Business(businessConfig)
      let handler1Called = false
      let handler2Called = false

      business.on('multi_event', () => { handler1Called = true })
      business.on('multi_event', () => { handler2Called = true })

      business.emit('multi_event', {})

      expect(handler1Called).toBe(true)
      expect(handler2Called).toBe(true)
    })

    it('should handle errors in event handlers gracefully', () => {
      const business = Business(businessConfig)
      let goodHandlerCalled = false

      business.on('error_event', () => { throw new Error('Handler error') })
      business.on('error_event', () => { goodHandlerCalled = true })

      expect(() => business.emit('error_event', {})).not.toThrow()
      expect(goodHandlerCalled).toBe(true)
    })
  })

  describe('Task assignment', () => {
    it('should assign tasks to agents', () => {
      const business = Business(businessConfig)
      const task = business.assign('Analyze quarterly data', business.agents!.dataAnalyst)

      expect(task).toBeDefined()
      expect(task.title).toBe('Analyze quarterly data')
      expect(task.assignee).toBe(business.agents!.dataAnalyst)
      expect(task.status).toBe('in_progress')
      expect(task.id).toMatch(/^task_/)
    })

    it('should assign tasks to humans', () => {
      const business = Business(businessConfig)
      const task = business.assign('Review marketing strategy', business.roles!.manager)

      expect(task).toBeDefined()
      expect(task.title).toBe('Review marketing strategy')
      expect(task.assignee).toBe(business.roles!.manager)
      expect(task.status).toBe('pending')
    })

    it('should emit events when tasks are created', () => {
      const business = Business(businessConfig)
      let taskCreatedEvent: any = null

      business.on('task_created', (data: any) => {
        taskCreatedEvent = data
      })

      const task = business.assign('Test task', business.agents!.dataAnalyst)

      expect(taskCreatedEvent).toBeDefined()
      expect(taskCreatedEvent.task).toBe(task)
      expect(taskCreatedEvent.assignee).toBe(business.agents!.dataAnalyst)
    })

    it('should emit events when agent tasks complete', (done) => {
      const business = Business(businessConfig)
      
      business.on('task_completed', (data: any) => {
        expect(data.task.status).toBe('completed')
        expect(data.assignee).toBe(business.agents!.dataAnalyst)
        done()
      })

      business.assign('Quick task', business.agents!.dataAnalyst)
    }, 1000)
  })

  describe('Task management', () => {
    it('should retrieve all tasks', () => {
      const business = Business(businessConfig)
      
      business.assign('Task 1', business.agents!.dataAnalyst)
      business.assign('Task 2', business.roles!.manager)
      
      const allTasks = business.getTasks()
      expect(allTasks).toHaveLength(2)
    })

    it('should filter tasks by status', () => {
      const business = Business(businessConfig)
      
      business.assign('Agent Task', business.agents!.dataAnalyst)
      business.assign('Human Task', business.roles!.manager)
      
      const pendingTasks = business.getTasks('pending')
      const inProgressTasks = business.getTasks('in_progress')
      
      expect(pendingTasks).toHaveLength(1)
      expect(inProgressTasks).toHaveLength(1)
      expect(pendingTasks[0].title).toBe('Human Task')
      expect(inProgressTasks[0].title).toBe('Agent Task')
    })

    it('should approve tasks with proper permissions', async () => {
      const business = Business(businessConfig)
      const task = business.assign('Approval needed', business.roles!.manager)
      
      const approvedTask = await business.approveTask(task.id, business.roles!.ceo)
      
      expect(approvedTask.status).toBe('completed')
      expect(approvedTask.id).toBe(task.id)
    })

    it('should reject task approval without proper permissions', async () => {
      const business = Business(businessConfig)
      const task = business.assign('Approval needed', business.roles!.manager)
      
      const unauthorizedUser = {
        config: {
          name: 'Unauthorized User',
          email: 'user@test.com',
          role: 'User',
          permissions: [PermissionLevel.VIEW]
        }
      } as Human
      
      await expect(business.approveTask(task.id, unauthorizedUser))
        .rejects.toThrow('does not have approval permissions')
    })

    it('should reject approval of non-existent tasks', async () => {
      const business = Business(businessConfig)
      
      await expect(business.approveTask('non-existent-task', business.roles!.ceo))
        .rejects.toThrow('Task non-existent-task not found')
    })
  })

  describe('Metrics tracking', () => {
    it('should track business metrics', () => {
      const business = Business(businessConfig)
      
      business.track('revenue', 100000)
      business.track('customers', 50)
      business.track('revenue', 120000)
      
      const allMetrics = business.getMetrics()
      expect(allMetrics.revenue).toHaveLength(2)
      expect(allMetrics.customers).toHaveLength(1)
      expect(allMetrics.revenue[0].value).toBe(100000)
      expect(allMetrics.revenue[1].value).toBe(120000)
    })

    it('should retrieve specific metrics', () => {
      const business = Business(businessConfig)
      
      business.track('satisfaction', 4.5)
      business.track('churn_rate', 0.05)
      
      const satisfactionMetrics = business.getMetrics('satisfaction')
      expect(satisfactionMetrics.satisfaction).toHaveLength(1)
      expect(satisfactionMetrics.satisfaction[0].value).toBe(4.5)
      expect(satisfactionMetrics.churn_rate).toBeUndefined()
    })

    it('should emit events when metrics are tracked', () => {
      const business = Business(businessConfig)
      let metricEvent: any = null
      
      business.on('metric_tracked', (data: any) => {
        metricEvent = data
      })
      
      business.track('conversion_rate', 0.15)
      
      expect(metricEvent).toBeDefined()
      expect(metricEvent.metric).toBe('conversion_rate')
      expect(metricEvent.value).toBe(0.15)
    })
  })

  describe('Scheduling', () => {
    it('should register scheduled operations', () => {
      const business = Business(businessConfig)
      let operationCalled = false
      
      business.every('daily', () => {
        operationCalled = true
      })
      
      expect(operationCalled).toBe(false)
    })

    it('should register cron-based schedules', () => {
      const business = Business(businessConfig)
      let cronJobEvent: any = null
      
      business.on('job_scheduled', (data: any) => {
        cronJobEvent = data
      })
      
      business.schedule('0 9 * * *', () => {
        console.log('Daily 9 AM job')
      })
      
      expect(cronJobEvent).toBeDefined()
      expect(cronJobEvent.cronExpression).toBe('0 9 * * *')
    })
  })

  describe('System integration', () => {
    it('should integrate with external systems', () => {
      const business = Business(businessConfig)
      let integrationEvent: any = null
      
      business.on('system_integrated', (data: any) => {
        integrationEvent = data
      })
      
      const crmConfig = {
        endpoint: 'https://crm.test.com/api',
        apiKey: 'test-key'
      }
      
      business.integrate('crm', crmConfig)
      
      expect(integrationEvent).toBeDefined()
      expect(integrationEvent.systemName).toBe('crm')
      expect(integrationEvent.config).toEqual(crmConfig)
    })
  })

  describe('Method chaining', () => {
    it('should support method chaining for fluent API', () => {
      const business = Business(businessConfig)
      
      const result = business
        .on('test', () => {})
        .every('daily', () => {})
        .track('metric', 100)
        .emit('event', {})
        .integrate('system', {})
        .schedule('0 * * * *', () => {})
      
      expect(result).toBe(business)
    })
  })

  describe('Agent functionality', () => {
    it('should execute agent operations', async () => {
      const business = Business(businessConfig)
      const agent = business.agents!.dataAnalyst
      
      const result = await agent.execute({ query: 'sales data' })
      
      expect(result).toBeDefined()
      expect(result.result).toBe('Agent execution completed')
      expect(result.input.query).toBe('sales data')
    })

    it('should support dynamic agent methods', async () => {
      const business = Business(businessConfig)
      const agent = business.agents!.dataAnalyst
      
      const result = await agent.do.analyzeData('quarterly', 'revenue')
      
      expect(result).toBeDefined()
      expect(result.action).toBe('analyzeData')
      expect(result.args).toEqual(['quarterly', 'revenue'])
      expect(result.agent).toBe('Data Analysis Agent')
    })
  })

  describe('Human functionality', () => {
    it('should request human approval', async () => {
      const business = Business(businessConfig)
      const human = business.roles!.manager
      
      const approvalRequest = await human.requestApproval({ task: 'Review budget' })
      
      expect(approvalRequest).toBeDefined()
      expect(approvalRequest.status).toBe('pending')
      expect(approvalRequest.approvalRequired).toBe(true)
      expect(approvalRequest.taskId).toMatch(/^approval_/)
    })

    it('should get human responses', async () => {
      const business = Business(businessConfig)
      const human = business.roles!.ceo
      
      const response = await human.getResponse('test-task-id')
      
      expect(response).toBeDefined()
      expect(response.taskId).toBe('test-task-id')
      expect(response.response).toBe('Human response')
    })

    it('should notify humans', async () => {
      const business = Business(businessConfig)
      const human = business.roles!.manager
      
      await expect(human.notify('Test notification')).resolves.not.toThrow()
      await expect(human.notify('Test notification', 'slack')).resolves.not.toThrow()
    })
  })

  describe('Workflow functionality', () => {
    it('should execute workflows', async () => {
      const business = Business(businessConfig)
      const workflow = business.processes!.customerOnboarding
      
      const result = await workflow.execute({ customerId: '123' })
      
      expect(result).toBeDefined()
      expect(result.result).toBe('Workflow execution completed')
      expect(result.input.customerId).toBe('123')
      expect(result.workflow).toBe('Customer Onboarding')
    })

    it('should get workflow status', async () => {
      const business = Business(businessConfig)
      const workflow = business.processes!.customerOnboarding
      
      const status = await workflow.getStatus()
      
      expect(status).toBe('completed')
    })
  })

  describe('Error handling', () => {
    it('should handle missing configuration gracefully', () => {
      const minimalConfig: BusinessConfig = {
        name: 'Minimal Company'
      }
      
      const business = Business(minimalConfig)
      
      expect(business).toBeDefined()
      expect(business.name).toBe('Minimal Company')
      expect(business.agents).toBeUndefined()
      expect(business.roles).toBeUndefined()
      expect(business.processes).toBeUndefined()
    })

    it('should handle invalid task assignments', () => {
      const business = Business(businessConfig)
      
      expect(() => {
        business.assign('Invalid task', {} as Agent)
      }).not.toThrow()
    })
  })
})
