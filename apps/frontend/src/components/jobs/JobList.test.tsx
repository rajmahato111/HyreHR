import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { JobList } from './JobList';

const mockJobs = [
  {
    id: 'job-1',
    title: 'Senior Software Engineer',
    status: 'OPEN',
    employmentType: 'FULL_TIME',
    department: { name: 'Engineering' },
    openedAt: new Date('2025-01-01'),
    _count: { applications: 5 },
  },
  {
    id: 'job-2',
    title: 'Product Manager',
    status: 'OPEN',
    employmentType: 'FULL_TIME',
    department: { name: 'Product' },
    openedAt: new Date('2025-01-15'),
    _count: { applications: 3 },
  },
];

describe('JobList', () => {
  it('should render job list', () => {
    render(
      <BrowserRouter>
        <JobList jobs={mockJobs} onEdit={vi.fn()} onDelete={vi.fn()} />
      </BrowserRouter>
    );

    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Product Manager')).toBeInTheDocument();
  });

  it('should display job status', () => {
    render(
      <BrowserRouter>
        <JobList jobs={mockJobs} onEdit={vi.fn()} onDelete={vi.fn()} />
      </BrowserRouter>
    );

    const statusElements = screen.getAllByText('OPEN');
    expect(statusElements.length).toBeGreaterThan(0);
  });

  it('should show application count', () => {
    render(
      <BrowserRouter>
        <JobList jobs={mockJobs} onEdit={vi.fn()} onDelete={vi.fn()} />
      </BrowserRouter>
    );

    expect(screen.getByText(/5/)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });
});
