import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workflow, WorkflowExecution } from '../../database/entities';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { WorkflowEngineService } from './workflow-engine.service';
import { WorkflowTemplatesService } from './workflow-templates.service';

@Module({
  imports: [TypeOrmModule.forFeature([Workflow, WorkflowExecution])],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, WorkflowEngineService, WorkflowTemplatesService],
  exports: [WorkflowsService, WorkflowEngineService, WorkflowTemplatesService],
})
export class WorkflowsModule {}
