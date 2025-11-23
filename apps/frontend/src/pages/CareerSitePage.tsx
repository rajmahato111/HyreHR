import { useParams } from 'react-router-dom';
import { PublicJobListing } from '../components/career-site/PublicJobListing';

export function CareerSitePage() {
    const { slug } = useParams<{ slug: string }>();

    if (!slug) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Career Site Not Found</h1>
                    <p className="text-gray-600">Invalid career site URL</p>
                </div>
            </div>
        );
    }

    return <PublicJobListing slug={slug} />;
}
