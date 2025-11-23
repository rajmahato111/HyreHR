import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { careerSiteService } from '../services/career-site';

export function CareerSiteJobDetailPage() {
    const { slug, jobId } = useParams<{ slug: string; jobId: string }>();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        loadJob();
    }, [slug, jobId]);

    const loadJob = async () => {
        if (!slug || !jobId) return;

        setLoading(true);
        try {
            const data = await careerSiteService.getPublicJob(slug, jobId);
            setJob(data);
        } catch (err) {
            console.error('Failed to load job:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
                    <p className="text-gray-600 mb-4">This job posting is no longer available.</p>
                    <Link
                        to={`/careers/${slug}`}
                        className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                        ← Back to all jobs
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
                <div className="max-w-4xl mx-auto px-6">
                    <Link
                        to={`/careers/${slug}`}
                        className="text-white/80 hover:text-white mb-4 inline-block"
                    >
                        ← Back to all jobs
                    </Link>
                    <h1 className="text-4xl font-bold mb-4">{job.title}</h1>
                    <div className="flex flex-wrap gap-4 text-sm">
                        {job.department && <span>📁 {job.department}</span>}
                        {job.locations && job.locations.length > 0 && (
                            <span>📍 {job.locations.map((l: any) => l.name).join(', ')}</span>
                        )}
                        {job.employmentType && <span>💼 {job.employmentType}</span>}
                        {job.remoteOk && <span>🏠 Remote OK</span>}
                    </div>
                </div>
            </div>

            {/* Job Details */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
                    {/* Salary */}
                    {job.salaryRange && (
                        <div className="mb-6 pb-6 border-b">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Compensation</h2>
                            <p className="text-2xl font-bold text-purple-600">
                                {job.salaryRange.currency} {job.salaryRange.min.toLocaleString()} -{' '}
                                {job.salaryRange.max.toLocaleString()}
                            </p>
                        </div>
                    )}

                    {/* Description */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Role</h2>
                        <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
                            {job.description}
                        </div>
                    </div>

                    {/* Apply Button */}
                    <div className="flex gap-4">
                        <Link
                            to={`/careers/${slug}/jobs/${jobId}/apply`}
                            className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl text-center"
                        >
                            Apply for this Position
                        </Link>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">About the Company</h2>
                    <p className="text-gray-700">
                        Join our team and help build the future of AI-powered recruiting. We're looking for
                        talented individuals who are passionate about technology and innovation.
                    </p>
                </div>
            </div>
        </div>
    );
}
