import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CandidateQuickView } from './CandidateQuickView';

const mockCandidate = {
  id: 'candidate-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  currentTitle: 'Software Engineer',
  currentCompany: 'Tech Corp',
  tags: ['javascript', 'react', 'nodejs'],
};

describe('CandidateQuickView', () => {
  it('should render candidate information', () => {
    render(
      <CandidateQuickView 
        candidate={mockCandidate} 
        onClose={vi.fn()} 
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });

  it('should display candidate tags', () => {
    render(
      <CandidateQuickView 
        candidate={mockCandidate} 
        onClose={vi.fn()} 
      />
    );

    expect(screen.getByText('javascript')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('nodejs')).toBeInTheDocument();
  });

  it('should show contact information', () => {
    render(
      <CandidateQuickView 
        candidate={mockCandidate} 
        onClose={vi.fn()} 
      />
    );

    expect(screen.getByText('+1234567890')).toBeInTheDocument();
  });
});
