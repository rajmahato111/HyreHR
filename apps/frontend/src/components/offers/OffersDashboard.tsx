import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Offer, OfferStatus } from '../../types/offer';
import offersService from '../../services/offers';

export const OffersDashboard: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OfferStatus | 'all'>('all');

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const data = await offersService.getOffers();
      setOffers(data);
    } catch (error) {
      console.error('Failed to load offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCounts = () => {
    return {
      total: offers.length,
      draft: offers.filter((o) => o.status === OfferStatus.DRAFT).length,
      pending_approval: offers.filter((o) => o.status === OfferStatus.PENDING_APPROVAL).length,
      approved: offers.filter((o) => o.status === OfferStatus.APPROVED).length,
      sent: offers.filter((o) => o.status === OfferStatus.SENT).length,
      accepted: offers.filter((o) => o.status === OfferStatus.ACCEPTED).length,
      declined: offers.filter((o) => o.status === OfferStatus.DECLINED).length,
      expired: offers.filter((o) => o.status === OfferStatus.EXPIRED).length,
    };
  };

  const getAcceptanceRate = () => {
    const sentOrResponded = offers.filter(
      (o) =>
        o.status === OfferStatus.SENT ||
        o.status === OfferStatus.ACCEPTED ||
        o.status === OfferStatus.DECLINED
    );
    const accepted = offers.filter((o) => o.status === OfferStatus.ACCEPTED);
    return sentOrResponded.length > 0
      ? ((accepted.length / sentOrResponded.length) * 100).toFixed(1)
      : '0';
  };

  const getAverageTimeToAccept = () => {
    const acceptedOffers = offers.filter(
      (o) => o.status === OfferStatus.ACCEPTED && o.sentAt && o.acceptedAt
    );
    if (acceptedOffers.length === 0) return 'N/A';

    const totalDays = acceptedOffers.reduce((sum, offer) => {
      const sent = new Date(offer.sentAt!).getTime();
      const accepted = new Date(offer.acceptedAt!).getTime();
      return sum + (accepted - sent) / (1000 * 60 * 60 * 24);
    }, 0);

    return `${(totalDays / acceptedOffers.length).toFixed(1)} days`;
  };

  const filteredOffers = filter === 'all' ? offers : offers.filter((o) => o.status === filter);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: OfferStatus) => {
    const styles = {
      [OfferStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [OfferStatus.PENDING_APPROVAL]: 'bg-yellow-100 text-yellow-800',
      [OfferStatus.APPROVED]: 'bg-blue-100 text-blue-800',
      [OfferStatus.SENT]: 'bg-purple-100 text-purple-800',
      [OfferStatus.ACCEPTED]: 'bg-green-100 text-green-800',
      [OfferStatus.DECLINED]: 'bg-red-100 text-red-800',
      [OfferStatus.EXPIRED]: 'bg-orange-100 text-orange-800',
      [OfferStatus.WITHDRAWN]: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const counts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading offers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Offers</div>
          <div className="text-3xl font-bold text-gray-900">{counts.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Pending Approval</div>
          <div className="text-3xl font-bold text-yellow-600">{counts.pending_approval}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Acceptance Rate</div>
          <div className="text-3xl font-bold text-green-600">{getAcceptanceRate()}%</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Avg. Time to Accept</div>
          <div className="text-3xl font-bold text-blue-600">{getAverageTimeToAccept()}</div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Offers by Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-md">
            <div className="text-2xl font-bold text-gray-900">{counts.draft}</div>
            <div className="text-sm text-gray-600">Draft</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-md">
            <div className="text-2xl font-bold text-blue-600">{counts.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-md">
            <div className="text-2xl font-bold text-purple-600">{counts.sent}</div>
            <div className="text-sm text-gray-600">Sent</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-md">
            <div className="text-2xl font-bold text-green-600">{counts.accepted}</div>
            <div className="text-sm text-gray-600">Accepted</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-md">
            <div className="text-2xl font-bold text-red-600">{counts.declined}</div>
            <div className="text-sm text-gray-600">Declined</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-md">
            <div className="text-2xl font-bold text-orange-600">{counts.expired}</div>
            <div className="text-sm text-gray-600">Expired</div>
          </div>
        </div>
      </div>

      {/* Offers List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">All Offers</h3>
            <div className="flex items-center space-x-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as OfferStatus | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value={OfferStatus.DRAFT}>Draft</option>
                <option value={OfferStatus.PENDING_APPROVAL}>Pending Approval</option>
                <option value={OfferStatus.APPROVED}>Approved</option>
                <option value={OfferStatus.SENT}>Sent</option>
                <option value={OfferStatus.ACCEPTED}>Accepted</option>
                <option value={OfferStatus.DECLINED}>Declined</option>
                <option value={OfferStatus.EXPIRED}>Expired</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOffers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No offers found
                  </td>
                </tr>
              ) : (
                filteredOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{offer.jobTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(offer.salary, offer.currency)}
                      </div>
                      {offer.bonus && (
                        <div className="text-xs text-gray-500">
                          + {formatCurrency(offer.bonus, offer.currency)} bonus
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(offer.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(offer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {offer.sentAt ? new Date(offer.sentAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {offer.expiresAt ? (
                        <div>
                          {new Date(offer.expiresAt).toLocaleDateString()}
                          {new Date(offer.expiresAt) < new Date() && (
                            <span className="ml-2 text-red-600 font-medium">Expired</span>
                          )}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/offers/${offer.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OffersDashboard;
