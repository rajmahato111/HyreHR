import React from 'react';
import { Link } from 'react-router-dom';
import { OffersDashboard } from '../components/offers';

export const OffersPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Offers</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage and track all job offers
              </p>
            </div>
            <Link
              to="/offers/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Offer
            </Link>
          </div>
        </div>

        {/* Dashboard */}
        <OffersDashboard />
      </div>
    </div>
  );
};

export default OffersPage;
