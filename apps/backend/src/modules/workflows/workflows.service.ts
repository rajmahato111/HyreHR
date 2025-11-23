import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow, WorkflowExecution, WorkflowExecutionStatus } from '../../database/entities';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto';

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
    @InjectRepository(WorkflowExecution)
    private workflowExecutionRepository: Repository<WorkflowExecution>,
  ) {}

  /**
   * Create a new workflow
   */
  async create(
    organizationId: string,
    userId: string,
    createDto: CreateWorkflowDto,
  ): Promise<Workflow> {
    // Validate actions
    if (!createDto.actions || createDto.actions.length === 0) {
      throw new BadRequestException('Workflow must have at least one action');
    }

    const workflow = this.workflowRepository.create({
      organizationId,
      createdBy: userId,
      ...createDto,
    });

    return this.workflowRepository.save(workflow);
  }

  /**
   * Find all workflows for an organization
   */
  async findAll(
    organizationId: string,
    activeOnly = false,
  ): Promise<Workflow[]> {
    const where: any = { organizationId };

    if (activeOnly) {
      where.active = true;
    }

    return this.workflowRepository.find({
      where,
      relations: ['creator'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find one workflow by ID
   */
  async findOne(id: string, organizationId: string): Promise<Workflow> {
    const workflow = await this.workflowRepository.findOne({
      where: { id, organizationId },
      relations: ['creator'],
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }

    return workflow;
  }

  /**
   * Update a workflow
   */
  async update(
    id: string,
    organizationId: string,
    updateDto: UpdateWorkflowDto,
  ): Promise<Workflow> {
    const workflow = await this.findOne(id, organizationId);

    // Validate actions if provided
    if (updateDto.actions && updateDto.actions.length === 0) {
      throw new BadRequestException('Workflow must have at least one action');
    }

    Object.assign(workflow, updateDto);

    return this.workflowRepository.save(workflow);
  }

  /**
   * Delete a workflow
   */
  async remove(id: string, organizationId: string): Promise<void> {
    const workflow = await this.findOne(id, organizationId);

    // Check if there are any pending or running executions
    const activeExecutions = await this.workflowExecutionRepository.count({
      where: {
        workflowId: id,
        status: WorkflowExecutionStatus.RUNNING,
      },
    });

    if (activeExecutions > 0) {
      throw new BadRequestException(
        `Cannot delete workflow with ${activeExecutions} active executions`,
      );
    }

    await this.workflowRepository.remove(workflow);
  }

  /**
   * Activate a workflow
   */
  async activate(id: string, organizationId: string): Promise<Workflow> {
    const workflow = await this.findOne(id, organizationId);
    workflow.active = true;
    return this.workflowRepository.save(workflow);
  }

  /**
   * Deactivate a workflow
   */
  async deactivate(id: string, organizationId: string): Promise<Workflow> {
    const workflow = await this.findOne(id, organizationId);
    workflow.active = false;
    return this.workflowRepository.save(workflow);
  }

  /**
   * Get workflow executions
   */
  async getExecutions(
    id: string,
    organizationId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: WorkflowExecution[]; total: number }> {
    // Verify workflow exists and belongs to organization
    await this.findOne(id, organizationId);

    const skip = (page - 1) * limit;

    const [data, total] = await this.workflowExecutionRepository.findAndCount({
      where: { workflowId: id },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total };
  }

  /**
   * Get workflow statistics
   */
  async getStatistics(
    id: string,
    organizationId: string,
  ): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
  }> {
    // Verify workflow exists and belongs to organization
    await this.findOne(id, organizationId);

    const executions = await this.workflowExecutionRepository.find({
      where: { workflowId: id },
    });

    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(
      (e) => e.status === WorkflowExecutionStatus.COMPLETED,
    ).length;
    const failedExecutions = executions.filter(
      (e) => e.status === WorkflowExecutionStatus.FAILED,
    ).length;

    // Calculate average execution time for completed executions
    const completedExecutions = executions.filter(
      (e) => e.status === WorkflowExecutionStatus.COMPLETED && e.startedAt && e.completedAt,
    );

    let averageExecutionTime = 0;
    if (completedExecutions.length > 0) {
      const totalTime = completedExecutions.reduce((sum, e) => {
        const duration =
          new Date(e.completedAt).getTime() - new Date(e.startedAt).getTime();
        return sum + duration;
      }, 0);
      averageExecutionTime = totalTime / completedExecutions.length / 1000; // Convert to seconds
    }

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageExecutionTime,
    };
  }
}
