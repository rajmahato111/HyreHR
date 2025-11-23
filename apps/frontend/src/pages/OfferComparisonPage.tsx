import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Offer } from '../types/offer';
import offersService from '../services/offers';
import { OfferComparison } from '../components/offers';

export const OfferComparisonPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    loadOffers();
  }, []);

  useEffect(() => {
    // Get offer IDs from URL params
    const ids = searchParams.get('ids')?.split(',') || [];
    setSelectedIds(ids);
    if (ids.length > 0) {
      loadSelectedOffers(ids);
    }
  }, [searchParams]);

  const loadOffers = async () => {
    try {
      const data = await offersService.getOffers();
      setAllOffers(data);
    } catch (error) {
      console.error('Failed to load offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedOffers = async (ids: string[]) => {
    try {
      const promises = ids.map((id) => offersService.getOffer(id));
      const data = await Promise.all(promises);
      setOffers(data);
    } catch (error) {
      console.error('Failed to load selected offers:', error);
    }
  };

  const handleSelectionChange = (offerId: string, checked: boolean) => {
    let newIds: string[];
    if (checked) {
      newIds = [...selectedIds, offerId];
    } else {
      newIds = selectedIds.filter((id) => id !== offerId);
    }
    setSelectedIds(newIds);
    navigate(`/offers/compare?ids=${newIds.join(',')}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading offers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/offers')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Offers
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Compare Offers</h1>
          <p className="mt-2 text-sm text-gray-600">
            Select offers to compare side by side
          </p>
        </div>

        {/* Offer Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Select Offers to Compare</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allOffers.map((offer) => (
              <label
                key={offer.id}
                className="flex items-start space-x-3 p-4 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(offer.id)}
                  onChange={(e) => handleSelectionChange(offer.id, e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{offer.jobTitle}</div>
                  <div className="text-sm text-gray-600">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: offer.currency || 'USD',
                      minimumFractionDigits: 0,
                    }).format(offer.salary)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(offer.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </label>
            ))}
          </div>
          {allOffers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No offers available to compare
            </div>
          )}
        </div>

        {/* Comparison Table */}
        {selectedIds.length > 0 && <OfferComparison offers={offers} />}

        {selectedIds.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            Select at least one offer to start comparing
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferComparisonPage;
