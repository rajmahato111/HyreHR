import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Offer } from '../types/offer';
import offersService from '../services/offers';
import { OfferDetail, OfferApprovalPanel } from '../components/offers';
import { OfferAcceptancePredictionComponent } from '../components/offers/OfferAcceptancePrediction';

export const OfferDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId] = useState('current-user-id'); // TODO: Get from auth context

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

  const handleUpdate = (updatedOffer: Offer) => {
    setOffer(updatedOffer);
  };

  const handleDelete = async () => {
    if (!offer || !confirm('Are you sure you want to delete this offer?')) return;

    try {
      await offersService.deleteOffer(offer.id);
      navigate('/offers');
    } catch (error) {
      console.error('Failed to delete offer:', error);
      alert('Failed to delete offer. Please try again.');
    }
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
          <Link to="/offers" className="text-blue-600 hover:text-blue-800">
            Back to Offers
          </Link>
        </div>
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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Offer Details</h1>
            </div>
            <div className="flex space-x-3">
              <Link
                to={`/offers/${offer.id}/edit`}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OfferDetail offer={offer} currentUserId={currentUserId} onUpdate={handleUpdate} />
          </div>
          <div className="space-y-6">
            {/* Offer Acceptance Prediction */}
            {(offer.status === 'sent' || offer.status === 'approved') && (
              <OfferAcceptancePredictionComponent offerId={offer.id} />
            )}
            
            <OfferApprovalPanel
              offer={offer}
              currentUserId={currentUserId}
              onApprovalChange={handleUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetailPage;
