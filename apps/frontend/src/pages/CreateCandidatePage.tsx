import { CandidateForm } from '../components/candidates/CandidateForm';

export function CreateCandidatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Candidate</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload a resume to auto-populate fields or enter information manually
          </p>
        </div>

        <CandidateForm />
      </div>
    </div>
  );
}
