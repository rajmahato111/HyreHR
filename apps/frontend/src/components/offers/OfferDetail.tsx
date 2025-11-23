import React, { useState } from 'react';
import { Offer, OfferStatus } from '../../types/offer';
import offersService from '../../services/offers';

interface OfferDetailProps {
  offer: Offer;
  currentUserId?: string;
  onUpdate?: (offer: Offer) => void;
}

export const OfferDetail: React.FC<OfferDetailProps> = ({ offer, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendData, setSendData] = useState({
    recipientEmail: '',
    recipientName: '',
    message: '',
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSendOffer = async () => {
    setLoading(true);
    try {
      const result = await offersService.sendOffer(offer.id, sendData);
      if (onUpdate) {
        onUpdate(result);
      }
      setShowSendModal(false);
      setSendData({ recipientEmail: '', recipientName: '', message: '' });
    } catch (error) {
      console.error('Failed to send offer:', error);
      alert('Failed to send offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm('Are you sure you want to withdraw this offer?')) return;

    setLoading(true);
    try {
      const result = await offersService.withdrawOffer(offer.id);
      if (onUpdate) {
        onUpdate(result);
      }
    } catch (error) {
      console.error('Failed to withdraw offer:', error);
      alert('Failed to withdraw offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canSend = offer.status === OfferStatus.APPROVED;
  const canWithdraw = offer.status === OfferStatus.SENT;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{offer.jobTitle}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Created on {new Date(offer.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${
              offer.status === OfferStatus.ACCEPTED
                ? 'bg-green-100 text-green-800'
                : offer.status === OfferStatus.DECLINED
                ? 'bg-red-100 text-red-800'
                : offer.status === OfferStatus.SENT
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {offer.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          {canSend && (
            <button
              onClick={() => setShowSendModal(true)}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Send Offer
            </button>
          )}
          {canWithdraw && (
            <button
              onClick={handleWithdraw}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Withdraw Offer
            </button>
          )}
        </div>
      </div>

      {/* Compensation Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Compensation Package</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Base Salary</label>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(offer.salary, offer.currency)}
            </div>
          </div>

          {offer.bonus && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Bonus</label>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(offer.bonus, offer.currency)}
              </div>
            </div>
          )}

          {offer.equity && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Equity</label>
              <div className="text-lg font-semibold text-gray-900">
                {offer.equity.amount.toLocaleString()} {offer.equity.type.replace('_', ' ')}
              </div>
              {offer.equity.vestingSchedule && (
                <div className="text-sm text-gray-600 mt-1">{offer.equity.vestingSchedule}</div>
              )}
            </div>
          )}

          <div className="md:col-span-2 pt-4 border-t">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Total Cash Compensation
            </label>
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(offer.salary + (offer.bonus || 0), offer.currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
        <div className="space-y-4">
          {offer.startDate && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
              <div className="text-gray-900">{new Date(offer.startDate).toLocaleDateString()}</div>
            </div>
          )}

          {offer.benefits && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Benefits</label>
              <div className="text-gray-900 whitespace-pre-wrap">{offer.benefits}</div>
            </div>
          )}

          {offer.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Internal Notes
              </label>
              <div className="text-gray-900 whitespace-pre-wrap">{offer.notes}</div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Timeline</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Created</div>
              <div className="text-xs text-gray-500">
                {new Date(offer.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          {offer.sentAt && (
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Sent to Candidate</div>
                <div className="text-xs text-gray-500">
                  {new Date(offer.sentAt).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {offer.acceptedAt && (
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Accepted</div>
                <div className="text-xs text-gray-500">
                  {new Date(offer.acceptedAt).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {offer.declinedAt && (
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Declined</div>
                <div className="text-xs text-gray-500">
                  {new Date(offer.declinedAt).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {offer.expiresAt && (
            <div className="flex items-center space-x-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  new Date(offer.expiresAt) < new Date() ? 'bg-red-400' : 'bg-orange-400'
                }`}
              ></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {new Date(offer.expiresAt) < new Date() ? 'Expired' : 'Expires'}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(offer.expiresAt).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Send Offer to Candidate</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={sendData.recipientName}
                  onChange={(e) => setSendData({ ...sendData, recipientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email *
                </label>
                <input
                  type="email"
                  required
                  value={sendData.recipientEmail}
                  onChange={(e) => setSendData({ ...sendData, recipientEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  rows={4}
                  value={sendData.message}
                  onChange={(e) => setSendData({ ...sendData, message: e.target.value })}
                  placeholder="Add a personal message..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowSendModal(false);
                  setSendData({ recipientEmail: '', recipientName: '', message: '' });
                }}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendOffer}
                disabled={loading || !sendData.recipientEmail || !sendData.recipientName}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Offer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferDetail;
