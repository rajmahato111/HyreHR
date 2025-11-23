import React, { useState, useEffect } from 'react';
import { CareerSite, Testimonial, CustomSection } from '../../types/career-site';
import { careerSiteService } from '../../services/career-site';

interface CareerSiteBuilderProps {
  careerSiteId?: string;
  onSave?: (careerSite: CareerSite) => void;
}

export const CareerSiteBuilder: React.FC<CareerSiteBuilderProps> = ({
  careerSiteId,
  onSave,
}) => {
  const [careerSite, setCareerSite] = useState<Partial<CareerSite>>({
    name: '',
    slug: '',
    published: false,
    branding: {},
    content: {
      testimonials: [],
      customSections: [],
    },
    seo: {},
    settings: {
      showJobCount: true,
      enableFilters: true,
      enableSearch: true,
      jobsPerPage: 20,
    },
  });
  const [activeTab, setActiveTab] = useState<'branding' | 'content' | 'seo' | 'settings'>(
    'branding',
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (careerSiteId) {
      loadCareerSite();
    }
  }, [careerSiteId]);

  const loadCareerSite = async () => {
    if (!careerSiteId) return;
    setLoading(true);
    try {
      const data = await careerSiteService.getCareerSite(careerSiteId);
      setCareerSite(data);
    } catch (error) {
      console.error('Failed to load career site:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let savedCareerSite: CareerSite;
      if (careerSiteId) {
        savedCareerSite = await careerSiteService.updateCareerSite(careerSiteId, careerSite);
      } else {
        savedCareerSite = await careerSiteService.createCareerSite(careerSite);
      }
      onSave?.(savedCareerSite);
    } catch (error) {
      console.error('Failed to save career site:', error);
    } finally {
      setSaving(false);
    }
  };

  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: `testimonial-${Date.now()}`,
      name: '',
      role: '',
      quote: '',
      order: careerSite.content?.testimonials?.length || 0,
    };
    setCareerSite({
      ...careerSite,
      content: {
        ...careerSite.content,
        testimonials: [...(careerSite.content?.testimonials || []), newTestimonial],
      },
    });
  };

  const removeTestimonial = (id: string) => {
    setCareerSite({
      ...careerSite,
      content: {
        ...careerSite.content,
        testimonials: careerSite.content?.testimonials?.filter((t) => t.id !== id),
      },
    });
  };

  const updateTestimonial = (id: string, updates: Partial<Testimonial>) => {
    setCareerSite({
      ...careerSite,
      content: {
        ...careerSite.content,
        testimonials: careerSite.content?.testimonials?.map((t) =>
          t.id === id ? { ...t, ...updates } : t,
        ),
      },
    });
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {careerSiteId ? 'Edit Career Site' : 'Create Career Site'}
        </h1>
        <p className="text-gray-600">
          Build and customize your company's career site to attract top talent
        </p>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Site Name</label>
            <input
              type="text"
              value={careerSite.name}
              onChange={(e) => setCareerSite({ ...careerSite, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g., Acme Careers"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">URL Slug</label>
            <input
              type="text"
              value={careerSite.slug}
              onChange={(e) => setCareerSite({ ...careerSite, slug: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g., acme-careers"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your career site will be at: /careers/{careerSite.slug}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex space-x-4 px-6">
            {['branding', 'content', 'seo', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-2 border-b-2 font-medium capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Branding & Design</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Logo URL</label>
                  <input
                    type="text"
                    value={careerSite.branding?.logo || ''}
                    onChange={(e) =>
                      setCareerSite({
                        ...careerSite,
                        branding: { ...careerSite.branding, logo: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Header Image URL</label>
                  <input
                    type="text"
                    value={careerSite.branding?.headerImage || ''}
                    onChange={(e) =>
                      setCareerSite({
                        ...careerSite,
                        branding: { ...careerSite.branding, headerImage: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="https://example.com/header.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Color</label>
                  <input
                    type="color"
                    value={careerSite.branding?.primaryColor || '#3B82F6'}
                    onChange={(e) =>
                      setCareerSite({
                        ...careerSite,
                        branding: { ...careerSite.branding, primaryColor: e.target.value },
                      })
                    }
                    className="w-full h-10 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Secondary Color</label>
                  <input
                    type="color"
                    value={careerSite.branding?.secondaryColor || '#10B981'}
                    onChange={(e) =>
                      setCareerSite({
                        ...careerSite,
                        branding: { ...careerSite.branding, secondaryColor: e.target.value },
                      })
                    }
                    className="w-full h-10 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Hero Title</label>
                <input
                  type="text"
                  value={careerSite.content?.heroTitle || ''}
                  onChange={(e) =>
                    setCareerSite({
                      ...careerSite,
                      content: { ...careerSite.content, heroTitle: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Join Our Team"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
                <input
                  type="text"
                  value={careerSite.content?.heroSubtitle || ''}
                  onChange={(e) =>
                    setCareerSite({
                      ...careerSite,
                      content: { ...careerSite.content, heroSubtitle: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Build the future with us"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">About Company</label>
                <textarea
                  value={careerSite.content?.aboutCompany || ''}
                  onChange={(e) =>
                    setCareerSite({
                      ...careerSite,
                      content: { ...careerSite.content, aboutCompany: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={4}
                  placeholder="Tell candidates about your company..."
                />
              </div>

              {/* Testimonials */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Employee Testimonials</h3>
                  <button
                    onClick={addTestimonial}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Testimonial
                  </button>
                </div>
                <div className="space-y-4">
                  {careerSite.content?.testimonials?.map((testimonial) => (
                    <div key={testimonial.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          value={testimonial.name}
                          onChange={(e) =>
                            updateTestimonial(testimonial.id, { name: e.target.value })
                          }
                          className="px-3 py-2 border rounded-lg"
                          placeholder="Employee Name"
                        />
                        <input
                          type="text"
                          value={testimonial.role}
                          onChange={(e) =>
                            updateTestimonial(testimonial.id, { role: e.target.value })
                          }
                          className="px-3 py-2 border rounded-lg"
                          placeholder="Job Title"
                        />
                      </div>
                      <textarea
                        value={testimonial.quote}
                        onChange={(e) =>
                          updateTestimonial(testimonial.id, { quote: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg mb-2"
                        rows={3}
                        placeholder="Testimonial quote..."
                      />
                      <button
                        onClick={() => removeTestimonial(testimonial.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Page Title</label>
                <input
                  type="text"
                  value={careerSite.seo?.title || ''}
                  onChange={(e) =>
                    setCareerSite({
                      ...careerSite,
                      seo: { ...careerSite.seo, title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Careers at Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Meta Description</label>
                <textarea
                  value={careerSite.seo?.description || ''}
                  onChange={(e) =>
                    setCareerSite({
                      ...careerSite,
                      seo: { ...careerSite.seo, description: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Join our team and help build amazing products..."
                />
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Site Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={careerSite.settings?.showJobCount || false}
                    onChange={(e) =>
                      setCareerSite({
                        ...careerSite,
                        settings: { ...careerSite.settings, showJobCount: e.target.checked },
                      })
                    }
                    className="mr-2"
                  />
                  <span>Show job count on listings</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={careerSite.settings?.enableFilters || false}
                    onChange={(e) =>
                      setCareerSite({
                        ...careerSite,
                        settings: { ...careerSite.settings, enableFilters: e.target.checked },
                      })
                    }
                    className="mr-2"
                  />
                  <span>Enable job filters</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={careerSite.settings?.enableSearch || false}
                    onChange={(e) =>
                      setCareerSite({
                        ...careerSite,
                        settings: { ...careerSite.settings, enableSearch: e.target.checked },
                      })
                    }
                    className="mr-2"
                  />
                  <span>Enable job search</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={careerSite.settings?.enableApplicationTracking || false}
                    onChange={(e) =>
                      setCareerSite({
                        ...careerSite,
                        settings: {
                          ...careerSite.settings,
                          enableApplicationTracking: e.target.checked,
                        },
                      })
                    }
                    className="mr-2"
                  />
                  <span>Enable application tracking for candidates</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Jobs per page</label>
                <input
                  type="number"
                  value={careerSite.settings?.jobsPerPage || 20}
                  onChange={(e) =>
                    setCareerSite({
                      ...careerSite,
                      settings: {
                        ...careerSite.settings,
                        jobsPerPage: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-32 px-3 py-2 border rounded-lg"
                  min="5"
                  max="100"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 mt-6">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Career Site'}
        </button>
      </div>
    </div>
  );
};
