import React, { useEffect, useState } from 'react';
import { predictiveService, OfferAcceptancePrediction } from '../../services/predictive';

interface OfferAcceptancePredictionProps {
  offerId: string;
}

export const OfferAcceptancePredictionComponent: React.FC<OfferAcceptancePredictionProps> = ({
  offerId,
}) => {
  const [prediction, setPrediction] = useState<OfferAcceptancePrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setLoading(true);
        const data = await predictiveService.getOfferAcceptancePrediction(offerId);
        setPrediction(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load prediction');
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [offerId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600">
          <p className="font-semibold">Unable to load prediction</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return null;
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'text-green-600';
    if (probability >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Offer Acceptance Prediction</h3>
          <p className="text-sm text-gray-500">AI-powered probability based on candidate signals</p>
        </div>
        <div className="flex items-center space-x-1 text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-xs font-medium">AI</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline space-x-2">
            <span className={`text-4xl font-bold ${getProbabilityColor(prediction.acceptanceProbability)}`}>
              {prediction.acceptanceProbability}%
            </span>
            <span className="text-lg text-gray-600">likely to accept</span>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(
              prediction.riskLevel,
            )}`}
          >
            {prediction.riskLevel.charAt(0).toUpperCase() + prediction.riskLevel.slice(1)} Risk
          </span>
        </div>

        <div className="relative pt-1">
          <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200">
            <div
              style={{ width: `${prediction.acceptanceProbability}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                prediction.acceptanceProbability >= 70
                  ? 'bg-green-500'
                  : prediction.acceptanceProbability >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low (0%)</span>
            <span>Medium (50%)</span>
            <span>High (100%)</span>
          </div>
        </div>
      </div>

      {prediction.recommendations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Recommendations</h4>
          <div className="space-y-2">
            {prediction.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2">
                <svg
                  className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Factors</h4>
        <div className="space-y-3">
          {prediction.factors.slice(0, 5).map((factor, index) => (
            <div key={index} className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">{factor.name}</span>
                  {factor.impact !== 0 && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        factor.impact > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {factor.impact > 0 ? '+' : ''}
                      {Math.abs(factor.impact).toFixed(1)}pp
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{factor.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          onClick={() => {
            // In production, this would open a modal with detailed explanation
            alert('Detailed prediction analysis coming soon!');
          }}
        >
          View detailed analysis →
        </button>
      </div>
    </div>
  );
};
