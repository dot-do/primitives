# business-as-code

[![npm version](https://img.shields.io/npm/v/business-as-code.svg)](https://www.npmjs.com/package/business-as-code)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> Define, launch, experiment, iterate, and grow your business entirely in code

## Overview

`business-as-code` enables organizations to represent their businesses and processes in code for human-AI collaboration. Unlike `ai-business` which focuses on AI-only businesses, this package provides interfaces for integrating human roles, AI agents, and defining collaboration points between them.

## Installation

```bash
npm install business-as-code
# or
yarn add business-as-code
# or
pnpm add business-as-code
```

## Usage

### Creating a Business with Human-AI Collaboration

```typescript
import { Business } from 'business-as-code'
import type { AgentConfig, HumanConfig } from 'business-as-code'

// Define human roles
const ceoConfig: HumanConfig = {
  name: 'John Doe',
  email: 'ceo@acme.com',
  role: 'Chief Executive Officer',
  permissions: ['admin', 'approve']
}

const ctoConfig: HumanConfig = {
  name: 'Jane Smith',
  email: 'cto@acme.com', 
  role: 'Chief Technology Officer',
  permissions: ['execute', 'approve']
}

// Define AI agents
const dataAnalystConfig: AgentConfig = {
  name: 'Data Analysis Agent',
  role: 'Data Analyst',
  objective: 'Analyze business data and generate insights',
  keyResults: ['Generate weekly reports', 'Identify trends', 'Provide recommendations']
}

const customerSupportConfig: AgentConfig = {
  name: 'Customer Support Agent',
  role: 'Customer Support',
  objective: 'Handle customer inquiries efficiently',
  keyResults: ['Resolve 95% of tickets within 24h', 'Maintain 4.5+ satisfaction rating']
}

// Define business processes
const customerOnboardingProcess = {
  name: 'Customer Onboarding',
  description: 'Process for onboarding new customers',
  steps: [
    {
      id: 'welcome',
      name: 'Send Welcome Email',
      description: 'Send personalized welcome email',
      type: 'automated',
      inputs: ['customer_email', 'customer_name'],
      outputs: ['email_sent']
    },
    {
      id: 'setup',
      name: 'Account Setup',
      description: 'Set up customer account',
      type: 'manual',
      inputs: ['customer_data'],
      outputs: ['account_created']
    }
  ],
  triggers: ['new_customer_signup'],
  outcomes: ['customer_onboarded']
}

// Define your business
const myCompany = Business({
  name: 'Acme Corporation',
  url: 'https://acme.com',
  vision: 'To revolutionize industry X with innovative solutions',
  goals: [
    {
      objective: 'Increase market share by 20%',
      keyResults: ['Launch 3 new products', 'Expand to 2 new geographical markets', 'Increase customer retention by 15%'],
    },
  ],
  // Human roles
  roles: {
    ceo: ceoConfig,
    cto: ctoConfig,
  },
  // AI agents
  agents: {
    dataAnalyst: dataAnalystConfig,
    customerSupport: customerSupportConfig,
  },
  // Organizational structure
  departments: {
    engineering: {
      name: 'Engineering Department',
      lead: ctoConfig,
      members: [dataAnalystConfig],
    },
  },
  // Business processes
  processes: {
    customerOnboarding: customerOnboardingProcess,
  },
})

// Event handling
myCompany.on('new_customer', (data) => {
  // Trigger customer onboarding workflow
  console.log(`New customer: ${data.name}`)
})

// Scheduled operations
myCompany.every('day', () => {
  // Daily operations
  console.log('Performing daily operations')
})

// Task assignment
myCompany.assign('Analyze quarterly sales data', myCompany.agents.dataAnalyst)
myCompany.assign('Review marketing strategy', myCompany.roles.marketingManager)

// Track business metrics
myCompany.track('customer_satisfaction', 4.8)
myCompany.track('monthly_revenue', 125000)
```

## Differences from `ai-business`

While `ai-business` focuses on AI-driven business functions, `business-as-code` is designed specifically for representing existing organizations with both human employees and AI agents:

| Feature              | business-as-code                   | ai-business                    |
| -------------------- | ---------------------------------- | ------------------------------ |
| Primary focus        | Human-AI collaboration             | AI-driven business functions   |
| Organizational model | Comprehensive (roles, departments) | Limited (focused on functions) |
| Human roles          | Explicit role definitions          | Not specifically modeled       |
| Decision approval    | Built-in approval workflows        | Automated decision making      |
| Task assignment      | Supports both humans and AI        | Primarily AI-focused           |
| Integration          | Designed for existing org systems  | Standalone AI capabilities     |

## Key Design Considerations

### 1. Organizational hierarchy

```typescript
// Define departments with reporting lines
const company = Business({
  departments: {
    engineering: {
      name: 'Engineering',
      lead: CTO,
      members: [SeniorEngineer, JuniorEngineer, AICodeReviewer],
    },
  },
})
```

### 2. Human-AI collaboration points

```typescript
// AI can suggest changes that require human approval
company.on('content_suggestion', (suggestion, approver) => {
  // Request approval from human
  approver.requestApproval(suggestion)
})
```

### 3. Task assignment

```typescript
// Assign tasks based on nature and complexity
function assignTask(task) {
  if (task.requiresCreativity) {
    company.assign(task, company.roles.humanCreative)
  } else if (task.isRepetitive) {
    company.assign(task, company.agents.automationAgent)
  }
}
```

### 4. Event handling differences

```typescript
// Human events may require notifications
company.on('urgent_issue', (issue) => {
  if (issue.assignee instanceof Human) {
    sendNotification(issue.assignee)
  } else {
    // AI can handle immediately
    issue.assignee.handle(issue)
  }
})
```

### 5. Permission workflows

```typescript
// AI can draft but needs human approval for publishing
company.agents.contentWriter.setPermission('content.publish', 'suggest')
company.roles.contentManager.setPermission('content.publish', 'approve')
```

### 6. System integration

```typescript
// Connect with existing organizational systems
company.integrate('crm', {
  endpoint: 'https://crm.company.com/api',
  handlers: {
    // Map events between systems
    'crm:new_customer': (data) => company.trigger('new_customer', data),
  },
})
```

### 7. Role guidelines

```typescript
// Define when to use humans vs AI
const roleGuidelines = {
  customer_complaints: {
    simple: company.agents.customerSupport,
    complex: company.roles.customerSuccessManager,
    criteria: (complaint) => (complaint.sentiment < -0.8 ? 'complex' : 'simple'),
  },
}
```

## API Reference

### Functions

- `Business(config)` - Creates a new business representation

### Types

- `BusinessConfig` - Configuration for creating a business
- `BusinessInstance` - Instance returned by the Business function
- `PermissionLevel` - Enum for permission levels (VIEW, SUGGEST, EXECUTE, APPROVE, ADMIN)
- `Task` - Interface for task assignments
- `BusinessEvent` - Interface for business events

### Business Instance Methods

- `on(event, handler)` - Register event handler
- `every(schedule, operation)` - Register scheduled operation
- `assign(task, to)` - Assign a task to a human or AI
- `track(metric, value)` - Track business metrics

## Dependencies

- `zod` - Schema validation for type-safe business configurations
- Built-in Agent, Human, and Workflow implementations for human-AI collaboration
