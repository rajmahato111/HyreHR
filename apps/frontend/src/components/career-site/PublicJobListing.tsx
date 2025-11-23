import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicJob, CareerSite } from '../../types/career-site';
import { careerSiteService } from '../../services/career-site';

interface PublicJobListingProps {
  slug: string;
}

export const PublicJobListing: React.FC<PublicJobListingProps> = ({ slug }) => {
  const [careerSite, setCareerSite] = useState<CareerSite | null>(null);
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    departments: [] as string[],
    locations: [] as string[],
    employmentTypes: [] as string[],
  });

  useEffect(() => {
    loadCareerSite();
  }, [slug]);

  useEffect(() => {
    if (careerSite) {
      loadJobs();
    }
  }, [slug, page, filters, careerSite]);

  const loadCareerSite = async () => {
    try {
      const data = await careerSiteService.getPublicCareerSite(slug);
      setCareerSite(data);
    } catch (error) {
      console.error('Failed to load career site:', error);
    }
  };

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await careerSiteService.getPublicJobs(slug, {
        ...filters,
        page,
        limit: careerSite?.settings?.jobsPerPage || 20,
      });
      setJobs(response.jobs);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search });
    setPage(1);
  };

  if (!careerSite) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const branding = careerSite.branding || {};
  const content = careerSite.content || {};

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: branding.fontFamily || 'system-ui',
      }}
    >
      {/* Header */}
      <header
        className="bg-cover bg-center text-white py-20"
        style={{
          backgroundImage: branding.headerImage
            ? `url(${branding.headerImage})`
            : `linear-gradient(135deg, ${branding.primaryColor || '#3B82F6'}, ${branding.secondaryColor || '#10B981'})`,
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          {branding.logo && (
            <img src={branding.logo} alt="Company Logo" className="h-12 mb-6" />
          )}
          <h1 className="text-5xl font-bold mb-4">{content.heroTitle || 'Join Our Team'}</h1>
          <p className="text-xl opacity-90">
            {content.heroSubtitle || 'Explore opportunities to grow your career'}
          </p>
        </div>
      </header>

      {/* About Section */}
      {content.aboutCompany && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">About Us</h2>
            <p className="text-lg text-gray-900 leading-relaxed">{content.aboutCompany}</p>
          </div>
        </section>
      )}

      {/* Benefits */}
      {content.benefits && content.benefits.length > 0 && (
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Why Join Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {content.benefits.map((benefit, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow">
                  <p className="text-lg text-gray-900">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {content.testimonials && content.testimonials.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8">What Our Team Says</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow">
                  {testimonial.photo && (
                    <img
                      src={testimonial.photo}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full mb-4"
                    />
                  )}
                  <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Job Listings */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">
            Open Positions
            {careerSite.settings?.showJobCount && ` (${total})`}
          </h2>

          {/* Search */}
          {careerSite.settings?.enableSearch && (
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search jobs..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>
          )}

          {/* Job List */}
          {loading ? (
            <div className="text-center py-12">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              No open positions at the moment. Check back soon!
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/careers/${slug}/jobs/${job.id}`}
                  className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{job.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                    {job.department && <span>📁 {job.department}</span>}
                    {job.locations && job.locations.length > 0 && (
                      <span>📍 {job.locations.map((l) => l.name).join(', ')}</span>
                    )}
                    {job.employmentType && <span>💼 {job.employmentType}</span>}
                    {job.remoteOk && <span>🏠 Remote OK</span>}
                  </div>
                  <p className="text-gray-700 line-clamp-2">{job.description}</p>
                  {job.salaryRange && (
                    <p className="text-sm text-gray-600 mt-2">
                      💰 {job.salaryRange.currency} {job.salaryRange.min.toLocaleString()} -{' '}
                      {job.salaryRange.max.toLocaleString()}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
