import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreateOfferDto,
  UpdateOfferDto,
  Offer,
  EquityDetails,
  OfferTemplate,
} from '../../types/offer';
import offersService from '../../services/offers';

interface OfferFormProps {
  applicationId?: string;
  offer?: Offer;
  onSubmit?: (offer: Offer) => void;
  onCancel?: () => void;
}

export const OfferForm: React.FC<OfferFormProps> = ({
  applicationId,
  offer,
  onSubmit,
  onCancel,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<OfferTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState<CreateOfferDto | UpdateOfferDto>({
    applicationId: applicationId || offer?.applicationId || '',
    jobTitle: offer?.jobTitle || '',
    salary: offer?.salary || 0,
    currency: offer?.currency || 'USD',
    bonus: offer?.bonus || undefined,
    equity: offer?.equity || undefined,
    startDate: offer?.startDate || '',
    benefits: offer?.benefits || '',
    notes: offer?.notes || '',
    expiryDays: 7,
  });

  const [equityEnabled, setEquityEnabled] = useState(!!offer?.equity);
  const [equityData, setEquityData] = useState<EquityDetails>({
    type: offer?.equity?.type || 'stock_options',
    amount: offer?.equity?.amount || 0,
    vestingSchedule: offer?.equity?.vestingSchedule || '',
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await offersService.getActiveTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleTemplateChange = async (templateId: string) => {
    setSelectedTemplate(templateId);
    if (!templateId) return;

    try {
      const template = await offersService.getTemplate(templateId);
      setFormData({
        ...formData,
        templateId,
        jobTitle: template.jobTitle,
        salary: template.salaryMin,
        currency: template.currency,
        bonus: template.bonusMin,
        equity: template.equity,
        benefits: template.benefits,
        notes: template.notes,
        expiryDays: template.expiryDays,
      });
      if (template.equity) {
        setEquityEnabled(true);
        setEquityData(template.equity);
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        equity: equityEnabled ? equityData : undefined,
      };

      let result: Offer;
      if (offer) {
        result = await offersService.updateOffer(offer.id, data);
      } else {
        result = await offersService.createOffer(data as CreateOfferDto);
      }

      if (onSubmit) {
        onSubmit(result);
      } else {
        navigate(`/offers/${result.id}`);
      }
    } catch (error) {
      console.error('Failed to save offer:', error);
      alert('Failed to save offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Template Selection */}
      {!offer && templates.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Use Template (Optional)
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select a template --</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Job Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Title *
        </label>
        <input
          type="text"
          required
          value={formData.jobTitle}
          onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Compensation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Base Salary *
          </label>
          <input
            type="number"
            required
            min="0"
            step="1000"
            value={formData.salary}
            onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bonus (Optional)
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={formData.bonus || ''}
            onChange={(e) =>
              setFormData({ ...formData, bonus: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Equity */}
      <div>
        <label className="flex items-center space-x-2 mb-2">
          <input
            type="checkbox"
            checked={equityEnabled}
            onChange={(e) => setEquityEnabled(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Include Equity</span>
        </label>

        {equityEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 p-4 bg-gray-50 rounded-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equity Type
              </label>
              <select
                value={equityData.type}
                onChange={(e) =>
                  setEquityData({
                    ...equityData,
                    type: e.target.value as 'stock_options' | 'rsu' | 'equity_grant',
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="stock_options">Stock Options</option>
                <option value="rsu">RSU</option>
                <option value="equity_grant">Equity Grant</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                min="0"
                value={equityData.amount}
                onChange={(e) =>
                  setEquityData({ ...equityData, amount: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vesting Schedule
              </label>
              <input
                type="text"
                placeholder="e.g., 4 years, 1 year cliff"
                value={equityData.vestingSchedule || ''}
                onChange={(e) =>
                  setEquityData({ ...equityData, vestingSchedule: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Start Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Start Date (Optional)
        </label>
        <input
          type="date"
          value={formData.startDate || ''}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Benefits */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Benefits (Optional)
        </label>
        <textarea
          rows={4}
          value={formData.benefits || ''}
          onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
          placeholder="Health insurance, 401k, PTO, etc."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Internal Notes (Optional)
        </label>
        <textarea
          rows={3}
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Internal notes about this offer"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Expiry Days */}
      {!offer && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Offer Expiry (Days)
          </label>
          <input
            type="number"
            min="1"
            value={formData.expiryDays || 7}
            onChange={(e) => setFormData({ ...formData, expiryDays: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel || (() => navigate(-1))}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : offer ? 'Update Offer' : 'Create Offer'}
        </button>
      </div>
    </form>
  );
};

export default OfferForm;
