import React, { useState } from 'react';
import { Offer, OfferApprover, ApprovalStatus } from '../../types/offer';
import offersService from '../../services/offers';

interface OfferApprovalPanelProps {
  offer: Offer;
  currentUserId: string;
  onApprovalChange?: (offer: Offer) => void;
}

export const OfferApprovalPanel: React.FC<OfferApprovalPanelProps> = ({
  offer,
  currentUserId,
  onApprovalChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [comments, setComments] = useState('');

  const currentApprover = offer.approvalWorkflow?.find(
    (approver) => approver.userId === currentUserId && approver.status === ApprovalStatus.PENDING
  );

  const isCurrentApproverTurn = () => {
    if (!offer.approvalWorkflow || !currentApprover) return false;

    // Check if all previous approvers have approved
    const previousApprovers = offer.approvalWorkflow.filter(
      (a) => a.order < currentApprover.order
    );
    return previousApprovers.every((a) => a.status === ApprovalStatus.APPROVED);
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      const result = await offersService.approveOffer(offer.id, { comments });
      if (onApprovalChange) {
        onApprovalChange(result);
      }
      setShowCommentModal(false);
      setComments('');
    } catch (error) {
      console.error('Failed to approve offer:', error);
      alert('Failed to approve offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const result = await offersService.rejectOffer(offer.id, { comments });
      if (onApprovalChange) {
        onApprovalChange(result);
      }
      setShowCommentModal(false);
      setComments('');
    } catch (error) {
      console.error('Failed to reject offer:', error);
      alert('Failed to reject offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (actionType: 'approve' | 'reject') => {
    setAction(actionType);
    setShowCommentModal(true);
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    const styles = {
      [ApprovalStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [ApprovalStatus.APPROVED]: 'bg-green-100 text-green-800',
      [ApprovalStatus.REJECTED]: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (!offer.approvalWorkflow || offer.approvalWorkflow.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Approval Workflow</h3>

      {/* Approval Chain */}
      <div className="space-y-3 mb-6">
        {offer.approvalWorkflow
          .sort((a, b) => a.order - b.order)
          .map((approver, index) => (
            <div
              key={`${approver.userId}-${approver.order}`}
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">
                    Approver {index + 1}
                  </span>
                  {getStatusBadge(approver.status)}
                </div>
                {approver.status === ApprovalStatus.APPROVED && approver.approvedAt && (
                  <p className="text-sm text-gray-600">
                    Approved on {new Date(approver.approvedAt).toLocaleDateString()}
                  </p>
                )}
                {approver.status === ApprovalStatus.REJECTED && approver.rejectedAt && (
                  <p className="text-sm text-gray-600">
                    Rejected on {new Date(approver.rejectedAt).toLocaleDateString()}
                  </p>
                )}
                {approver.comments && (
                  <p className="text-sm text-gray-700 mt-1 italic">"{approver.comments}"</p>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Action Buttons */}
      {currentApprover && isCurrentApproverTurn() && (
        <div className="flex space-x-3 pt-4 border-t">
          <button
            onClick={() => openModal('approve')}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Approve Offer
          </button>
          <button
            onClick={() => openModal('reject')}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Reject Offer
          </button>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {action === 'approve' ? 'Approve Offer' : 'Reject Offer'}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any comments about your decision..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setComments('');
                }}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={action === 'approve' ? handleApprove : handleReject}
                disabled={loading}
                className={`px-4 py-2 text-white rounded-md disabled:opacity-50 ${
                  action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading ? 'Processing...' : action === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferApprovalPanel;
