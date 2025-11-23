import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KanbanBoard } from './KanbanBoard';

const mockStages = [
  {
    id: 'stage-1',
    name: 'Applied',
    type: 'APPLIED',
    orderIndex: 0,
  },
  {
    id: 'stage-2',
    name: 'Phone Screen',
    type: 'PHONE_SCREEN',
    orderIndex: 1,
  },
];

const mockApplications = [
  {
    id: 'app-1',
    stageId: 'stage-1',
    candidate: {
      id: 'candidate-1',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    },
    appliedAt: new Date('2025-01-01'),
  },
  {
    id: 'app-2',
    stageId: 'stage-2',
    candidate: {
      id: 'candidate-2',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@example.com',
    },
    appliedAt: new Date('2025-01-02'),
  },
];

describe('KanbanBoard', () => {
  it('should render pipeline stages', () => {
    render(
      <KanbanBoard 
        stages={mockStages} 
        applications={mockApplications} 
        onMoveApplication={vi.fn()} 
      />
    );

    expect(screen.getByText('Applied')).toBeInTheDocument();
    expect(screen.getByText('Phone Screen')).toBeInTheDocument();
  });

  it('should display applications in correct stages', () => {
    render(
      <KanbanBoard 
        stages={mockStages} 
        applications={mockApplications} 
        onMoveApplication={vi.fn()} 
      />
    );

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });
});
