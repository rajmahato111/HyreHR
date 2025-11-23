import { useParams } from 'react-router-dom';
import { PublicApplicationForm } from '../components/career-site/PublicApplicationForm';

export function CareerSiteApplicationPage() {
    const { slug, jobId } = useParams<{ slug: string; jobId: string }>();

    if (!slug || !jobId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Not Found</h1>
                    <p className="text-gray-600">Invalid application URL</p>
                </div>
            </div>
        );
    }

    return <PublicApplicationForm slug={slug} jobId={jobId} />;
}
