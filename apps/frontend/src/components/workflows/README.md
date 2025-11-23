# Workflow Management UI

This directory contains the UI components for workflow automation management.

## Components

### WorkflowBuilder
A comprehensive form for creating and editing workflows with:
- Workflow name and description
- Trigger event selection
- Conditional logic builder (AND/OR operators)
- Action configuration with delays
- Active/inactive status toggle

### WorkflowList
Displays all workflows with:
- Filtering by status (all, active, inactive)
- Quick actions (activate/deactivate, edit, delete)
- Execution history access
- Workflow metadata display

### WorkflowExecutionHistory
Shows execution history for a workflow with:
- Paginated list of executions
- Status indicators (pending, running, completed, failed)
- Detailed execution view with steps
- Trigger data and error information

## Usage

```tsx
import { WorkflowsPage } from './pages/WorkflowsPage';

// In your router
<Route path="/workflows" element={<WorkflowsPage />} />
```

## Features

- **Visual Workflow Builder**: Drag-and-drop style interface for building workflows
- **Condition Builder**: Support for complex conditional logic with multiple operators
- **Action Configuration**: JSON-based configuration for flexible action setup
- **Execution Monitoring**: Real-time tracking of workflow executions
- **Template Support**: Create workflows from pre-built templates (backend integration)

## API Integration

All components use the `workflowsService` from `services/workflows.ts` which provides:
- CRUD operations for workflows
- Activation/deactivation
- Execution history retrieval
- Template management

## Requirements Covered

- **14.1**: Workflow creation with triggers, conditions, actions, and delays
- **14.4**: Workflow activation/deactivation
- **14.5**: Workflow execution logging and history view
