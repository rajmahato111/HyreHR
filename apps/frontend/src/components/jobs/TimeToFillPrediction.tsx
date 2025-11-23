import React, { useEffect, useState } from 'react';
import { predictiveService, TimeToFillPrediction } from '../../services/predictive';

interface TimeToFillPredictionProps {
  jobId: string;
}

export const TimeToFillPredictionComponent: React.FC<TimeToFillPredictionProps> = ({ jobId }) => {
  const [prediction, setPrediction] = useState<TimeToFillPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setLoading(true);
        const data = await predictiveService.getTimeToFillPrediction(jobId);
        setPrediction(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load prediction');
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [jobId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Time to Fill Prediction</h3>
          <p className="text-sm text-gray-500">AI-powered estimate based on historical data</p>
        </div>
        <div className="flex items-center space-x-1 text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-xs font-medium">AI</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-bold text-gray-900">{prediction.predictedDays}</span>
          <span className="text-lg text-gray-600">days</span>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Range: {prediction.confidenceInterval.lower} - {prediction.confidenceInterval.upper} days
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{
              width: `${Math.min((prediction.predictedDays / 90) * 100, 100)}%`,
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Fast (7d)</span>
          <span>Average (45d)</span>
          <span>Slow (90d+)</span>
        </div>
      </div>

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
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {factor.impact > 0 ? '+' : ''}
                      {Math.abs(factor.impact * 100).toFixed(0)}%
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
