import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Offer } from '../types/offer';
import offersService from '../services/offers';
import { OfferForm } from '../components/offers';

export const EditOfferPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOffer(id);
    }
  }, [id]);

  const loadOffer = async (offerId: string) => {
    try {
      const data = await offersService.getOffer(offerId);
      setOffer(data);
    } catch (error) {
      console.error('Failed to load offer:', error);
      alert('Failed to load offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (updatedOffer: Offer) => {
    navigate(`/offers/${updatedOffer.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading offer...</div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Offer Not Found</h2>
          <p className="text-gray-600 mb-4">The offer you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/offers/${offer.id}`)}
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
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Offer</h1>
          <p className="mt-2 text-sm text-gray-600">
            Update the offer details
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <OfferForm offer={offer} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default EditOfferPage;
