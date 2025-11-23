import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Workflow,
  WorkflowExecution,
  WorkflowExecutionStatus,
  WorkflowExecutionStep,
  WorkflowTriggerType,
  WorkflowActionType,
  WorkflowConditionOperator,
  WorkflowCondition,
  WorkflowAction,
} from '../../database/entities';

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
    @InjectRepository(WorkflowExecution)
    private workflowExecutionRepository: Repository<WorkflowExecution>,
  ) {}

  /**
   * Trigger workflows based on an event
   */
  async triggerWorkflows(
    organizationId: string,
    triggerType: WorkflowTriggerType,
    entityType: string,
    entityId: string,
    triggerData: Record<string, any>,
  ): Promise<WorkflowExecution[]> {
    this.logger.log(
      `Triggering workflows for ${triggerType} on ${entityType}:${entityId}`,
    );

    // Find all active workflows for this trigger type
    const workflows = await this.workflowRepository.find({
      where: {
        organizationId,
        triggerType,
        active: true,
      },
    });

    if (workflows.length === 0) {
      this.logger.debug(`No active workflows found for trigger ${triggerType}`);
      return [];
    }

    const executions: WorkflowExecution[] = [];

    for (const workflow of workflows) {
      try {
        // Check if trigger config matches (if specified)
        if (!this.matchesTriggerConfig(workflow.triggerConfig, triggerData)) {
          this.logger.debug(
            `Workflow ${workflow.id} trigger config does not match`,
          );
          continue;
        }

        // Evaluate conditions
        if (!this.evaluateConditions(workflow.conditions, triggerData)) {
          this.logger.debug(
            `Workflow ${workflow.id} conditions not met`,
          );
          continue;
        }

        // Create execution record
        const execution = await this.createExecution(
          workflow.id,
          entityType,
          entityId,
          triggerData,
        );

        // Execute workflow asynchronously
        this.executeWorkflow(execution.id).catch((error) => {
          this.logger.error(
            `Failed to execute workflow ${workflow.id}: ${error.message}`,
            error.stack,
          );
        });

        executions.push(execution);
      } catch (error) {
        this.logger.error(
          `Error processing workflow ${workflow.id}: ${error.message}`,
          error.stack,
        );
      }
    }

    return executions;
  }

  /**
   * Check if trigger configuration matches the trigger data
   */
  private matchesTriggerConfig(
    triggerConfig: Record<string, any>,
    triggerData: Record<string, any>,
  ): boolean {
    if (!triggerConfig || Object.keys(triggerConfig).length === 0) {
      return true; // No specific config, matches all
    }

    for (const [key, value] of Object.entries(triggerConfig)) {
      if (triggerData[key] !== value) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate workflow conditions
   */
  private evaluateConditions(
    conditions: WorkflowCondition[],
    data: Record<string, any>,
  ): boolean {
    if (!conditions || conditions.length === 0) {
      return true; // No conditions, always pass
    }

    let result = true;
    let currentLogicalOp: 'AND' | 'OR' = 'AND';

    for (const condition of conditions) {
      const conditionResult = this.evaluateCondition(condition, data);

      if (currentLogicalOp === 'AND') {
        result = result && conditionResult;
      } else {
        result = result || conditionResult;
      }

      // Set logical operator for next condition
      currentLogicalOp = condition.logicalOperator || 'AND';
    }

    return result;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(
    condition: WorkflowCondition,
    data: Record<string, any>,
  ): boolean {
    const fieldValue = this.getNestedValue(data, condition.field);

    switch (condition.operator) {
      case WorkflowConditionOperator.EQUALS:
        return fieldValue === condition.value;

      case WorkflowConditionOperator.NOT_EQUALS:
        return fieldValue !== condition.value;

      case WorkflowConditionOperator.CONTAINS:
        return (
          typeof fieldValue === 'string' &&
          fieldValue.includes(condition.value)
        );

      case WorkflowConditionOperator.NOT_CONTAINS:
        return (
          typeof fieldValue === 'string' &&
          !fieldValue.includes(condition.value)
        );

      case WorkflowConditionOperator.GREATER_THAN:
        return fieldValue > condition.value;

      case WorkflowConditionOperator.LESS_THAN:
        return fieldValue < condition.value;

      case WorkflowConditionOperator.IN:
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);

      case WorkflowConditionOperator.NOT_IN:
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);

      case WorkflowConditionOperator.IS_EMPTY:
        return (
          fieldValue === null ||
          fieldValue === undefined ||
          fieldValue === '' ||
          (Array.isArray(fieldValue) && fieldValue.length === 0)
        );

      case WorkflowConditionOperator.IS_NOT_EMPTY:
        return (
          fieldValue !== null &&
          fieldValue !== undefined &&
          fieldValue !== '' &&
          (!Array.isArray(fieldValue) || fieldValue.length > 0)
        );

      default:
        this.logger.warn(`Unknown condition operator: ${condition.operator}`);
        return false;
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Create a workflow execution record
   */
  private async createExecution(
    workflowId: string,
    entityType: string,
    entityId: string,
    triggerData: Record<string, any>,
  ): Promise<WorkflowExecution> {
    const execution = this.workflowExecutionRepository.create({
      workflowId,
      entityType,
      entityId,
      status: WorkflowExecutionStatus.PENDING,
      triggerData,
      steps: [],
    });

    return this.workflowExecutionRepository.save(execution);
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(executionId: string): Promise<void> {
    const execution = await this.workflowExecutionRepository.findOne({
      where: { id: executionId },
      relations: ['workflow'],
    });

    if (!execution) {
      throw new Error(`Workflow execution ${executionId} not found`);
    }

    if (execution.status !== WorkflowExecutionStatus.PENDING) {
      this.logger.warn(
        `Workflow execution ${executionId} is not in pending status`,
      );
      return;
    }

    try {
      // Update status to running
      execution.status = WorkflowExecutionStatus.RUNNING;
      execution.startedAt = new Date();
      await this.workflowExecutionRepository.save(execution);

      // Execute each action
      const steps: WorkflowExecutionStep[] = [];

      for (const action of execution.workflow.actions) {
        const step: WorkflowExecutionStep = {
          actionType: action.type,
          status: 'pending',
          startedAt: new Date(),
        };

        try {
          // Apply delay if specified
          if (action.delayMinutes && action.delayMinutes > 0) {
            this.logger.debug(
              `Delaying action ${action.type} by ${action.delayMinutes} minutes`,
            );
            await this.delay(action.delayMinutes * 60 * 1000);
          }

          // Execute action
          const result = await this.executeAction(
            action,
            execution.entityType,
            execution.entityId,
            execution.triggerData,
          );

          step.status = 'completed';
          step.completedAt = new Date();
          step.result = result;
        } catch (error) {
          step.status = 'failed';
          step.completedAt = new Date();
          step.error = error.message;
          this.logger.error(
            `Action ${action.type} failed: ${error.message}`,
            error.stack,
          );
        }

        steps.push(step);
      }

      // Update execution with results
      execution.steps = steps;
      execution.status = steps.some((s) => s.status === 'failed')
        ? WorkflowExecutionStatus.FAILED
        : WorkflowExecutionStatus.COMPLETED;
      execution.completedAt = new Date();

      await this.workflowExecutionRepository.save(execution);

      this.logger.log(
        `Workflow execution ${executionId} completed with status ${execution.status}`,
      );
    } catch (error) {
      execution.status = WorkflowExecutionStatus.FAILED;
      execution.error = error.message;
      execution.completedAt = new Date();
      await this.workflowExecutionRepository.save(execution);

      this.logger.error(
        `Workflow execution ${executionId} failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Execute a single action
   */
  private async executeAction(
    action: WorkflowAction,
    entityType: string,
    entityId: string,
    triggerData: Record<string, any>,
  ): Promise<any> {
    this.logger.debug(`Executing action ${action.type} for ${entityType}:${entityId}`);

    switch (action.type) {
      case WorkflowActionType.SEND_EMAIL:
        return this.executeSendEmailAction(action.config, entityId, triggerData);

      case WorkflowActionType.MOVE_TO_STAGE:
        return this.executeMoveToStageAction(action.config, entityId);

      case WorkflowActionType.SEND_NOTIFICATION:
        return this.executeSendNotificationAction(action.config, entityId, triggerData);

      case WorkflowActionType.CREATE_TASK:
        return this.executeCreateTaskAction(action.config, entityId, triggerData);

      case WorkflowActionType.UPDATE_FIELD:
        return this.executeUpdateFieldAction(action.config, entityType, entityId);

      case WorkflowActionType.ASSIGN_USER:
        return this.executeAssignUserAction(action.config, entityType, entityId);

      case WorkflowActionType.ADD_TAG:
        return this.executeAddTagAction(action.config, entityType, entityId);

      case WorkflowActionType.REMOVE_TAG:
        return this.executeRemoveTagAction(action.config, entityType, entityId);

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Execute send email action
   */
  private async executeSendEmailAction(
    config: Record<string, any>,
    entityId: string,
    triggerData: Record<string, any>,
  ): Promise<any> {
    // This would integrate with the communication service
    this.logger.debug(`Send email action: ${JSON.stringify(config)}`);
    return {
      action: 'send_email',
      templateId: config.templateId,
      recipientId: config.recipientId || entityId,
      success: true,
    };
  }

  /**
   * Execute move to stage action
   */
  private async executeMoveToStageAction(
    config: Record<string, any>,
    entityId: string,
  ): Promise<any> {
    // This would integrate with the applications service
    this.logger.debug(`Move to stage action: ${JSON.stringify(config)}`);
    return {
      action: 'move_to_stage',
      applicationId: entityId,
      stageId: config.stageId,
      success: true,
    };
  }

  /**
   * Execute send notification action
   */
  private async executeSendNotificationAction(
    config: Record<string, any>,
    entityId: string,
    triggerData: Record<string, any>,
  ): Promise<any> {
    this.logger.debug(`Send notification action: ${JSON.stringify(config)}`);
    return {
      action: 'send_notification',
      userId: config.userId,
      message: config.message,
      success: true,
    };
  }

  /**
   * Execute create task action
   */
  private async executeCreateTaskAction(
    config: Record<string, any>,
    entityId: string,
    triggerData: Record<string, any>,
  ): Promise<any> {
    this.logger.debug(`Create task action: ${JSON.stringify(config)}`);
    return {
      action: 'create_task',
      title: config.title,
      assigneeId: config.assigneeId,
      success: true,
    };
  }

  /**
   * Execute update field action
   */
  private async executeUpdateFieldAction(
    config: Record<string, any>,
    entityType: string,
    entityId: string,
  ): Promise<any> {
    this.logger.debug(`Update field action: ${JSON.stringify(config)}`);
    return {
      action: 'update_field',
      entityType,
      entityId,
      field: config.field,
      value: config.value,
      success: true,
    };
  }

  /**
   * Execute assign user action
   */
  private async executeAssignUserAction(
    config: Record<string, any>,
    entityType: string,
    entityId: string,
  ): Promise<any> {
    this.logger.debug(`Assign user action: ${JSON.stringify(config)}`);
    return {
      action: 'assign_user',
      entityType,
      entityId,
      userId: config.userId,
      success: true,
    };
  }

  /**
   * Execute add tag action
   */
  private async executeAddTagAction(
    config: Record<string, any>,
    entityType: string,
    entityId: string,
  ): Promise<any> {
    this.logger.debug(`Add tag action: ${JSON.stringify(config)}`);
    return {
      action: 'add_tag',
      entityType,
      entityId,
      tag: config.tag,
      success: true,
    };
  }

  /**
   * Execute remove tag action
   */
  private async executeRemoveTagAction(
    config: Record<string, any>,
    entityType: string,
    entityId: string,
  ): Promise<any> {
    this.logger.debug(`Remove tag action: ${JSON.stringify(config)}`);
    return {
      action: 'remove_tag',
      entityType,
      entityId,
      tag: config.tag,
      success: true,
    };
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get workflow execution by ID
   */
  async getExecution(executionId: string): Promise<WorkflowExecution> {
    const execution = await this.workflowExecutionRepository.findOne({
      where: { id: executionId },
      relations: ['workflow'],
    });

    if (!execution) {
      throw new Error(`Workflow execution ${executionId} not found`);
    }

    return execution;
  }

  /**
   * Get workflow executions for an entity
   */
  async getExecutionsForEntity(
    entityType: string,
    entityId: string,
  ): Promise<WorkflowExecution[]> {
    return this.workflowExecutionRepository.find({
      where: { entityType, entityId },
      relations: ['workflow'],
      order: { createdAt: 'DESC' },
    });
  }
}
