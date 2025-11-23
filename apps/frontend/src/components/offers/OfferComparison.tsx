import React from 'react';
import { Offer } from '../../types/offer';

interface OfferComparisonProps {
  offers: Offer[];
}

export const OfferComparison: React.FC<OfferComparisonProps> = ({ offers }) => {
  if (offers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No offers to compare. Select at least one offer.
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotalComp = (offer: Offer) => {
    let total = offer.salary;
    if (offer.bonus) total += offer.bonus;
    // Note: Equity value would need additional calculation
    return total;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                Attribute
              </th>
              {offers.map((offer) => (
                <th
                  key={offer.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">{offer.jobTitle}</span>
                    <span className="text-xs text-gray-500 mt-1">
                      {new Date(offer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Status */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                Status
              </td>
              {offers.map((offer) => (
                <td key={offer.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      offer.status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : offer.status === 'declined'
                        ? 'bg-red-100 text-red-800'
                        : offer.status === 'sent'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {offer.status.replace('_', ' ').toUpperCase()}
                  </span>
                </td>
              ))}
            </tr>

            {/* Base Salary */}
            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-gray-50">
                Base Salary
              </td>
              {offers.map((offer) => (
                <td key={offer.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span className="font-semibold text-lg">
                    {formatCurrency(offer.salary, offer.currency)}
                  </span>
                </td>
              ))}
            </tr>

            {/* Bonus */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                Bonus
              </td>
              {offers.map((offer) => (
                <td key={offer.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {offer.bonus ? formatCurrency(offer.bonus, offer.currency) : '-'}
                </td>
              ))}
            </tr>

            {/* Equity */}
            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-gray-50">
                Equity
              </td>
              {offers.map((offer) => (
                <td key={offer.id} className="px-6 py-4 text-sm text-gray-700">
                  {offer.equity ? (
                    <div>
                      <div className="font-medium">
                        {offer.equity.amount.toLocaleString()} {offer.equity.type.replace('_', ' ')}
                      </div>
                      {offer.equity.vestingSchedule && (
                        <div className="text-xs text-gray-500 mt-1">
                          {offer.equity.vestingSchedule}
                        </div>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
              ))}
            </tr>

            {/* Total Compensation */}
            <tr className="bg-blue-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 sticky left-0 bg-blue-50">
                Total Cash Comp
              </td>
              {offers.map((offer) => (
                <td key={offer.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span className="font-bold text-lg text-blue-600">
                    {formatCurrency(calculateTotalComp(offer), offer.currency)}
                  </span>
                </td>
              ))}
            </tr>

            {/* Start Date */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                Start Date
              </td>
              {offers.map((offer) => (
                <td key={offer.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {offer.startDate ? new Date(offer.startDate).toLocaleDateString() : '-'}
                </td>
              ))}
            </tr>

            {/* Benefits */}
            <tr className="bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900 sticky left-0 bg-gray-50 align-top">
                Benefits
              </td>
              {offers.map((offer) => (
                <td key={offer.id} className="px-6 py-4 text-sm text-gray-700">
                  {offer.benefits ? (
                    <div className="whitespace-pre-wrap max-w-xs">{offer.benefits}</div>
                  ) : (
                    '-'
                  )}
                </td>
              ))}
            </tr>

            {/* Expiry Date */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                Expiry Date
              </td>
              {offers.map((offer) => (
                <td key={offer.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {offer.expiresAt ? (
                    <div>
                      <div>{new Date(offer.expiresAt).toLocaleDateString()}</div>
                      {new Date(offer.expiresAt) < new Date() && (
                        <span className="text-xs text-red-600 font-medium">Expired</span>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
              ))}
            </tr>

            {/* Sent Date */}
            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-gray-50">
                Sent Date
              </td>
              {offers.map((offer) => (
                <td key={offer.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {offer.sentAt ? new Date(offer.sentAt).toLocaleDateString() : '-'}
                </td>
              ))}
            </tr>

            {/* Response Date */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                Response Date
              </td>
              {offers.map((offer) => (
                <td key={offer.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {offer.acceptedAt
                    ? new Date(offer.acceptedAt).toLocaleDateString()
                    : offer.declinedAt
                    ? new Date(offer.declinedAt).toLocaleDateString()
                    : '-'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OfferComparison;
