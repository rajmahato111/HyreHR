import React, { useState, useEffect } from 'react';
import { transcriptionService } from '../../services/transcription';
import {
  InterviewTranscript,
  TranscriptStatus,
} from '../../types/transcription';

interface InterviewTranscriptionProps {
  interviewId: string;
  onStartTranscription?: () => void;
}

export const InterviewTranscription: React.FC<InterviewTranscriptionProps> = ({
  interviewId,
  onStartTranscription,
}) => {
  const [transcript, setTranscript] = useState<InterviewTranscript | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'transcript' | 'summary' | 'keyPoints' | 'flags' | 'feedback'
  >('summary');

  useEffect(() => {
    loadTranscription();
    
    // Poll for updates if processing
    const interval = setInterval(() => {
      if (transcript?.status === TranscriptStatus.PROCESSING) {
        loadTranscription();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [interviewId, transcript?.status]);

  const loadTranscription = async () => {
    try {
      setLoading(true);
      const response = await transcriptionService.getTranscription(interviewId);
      setTranscript(response.transcript);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load transcription');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTranscription = async () => {
    try {
      setLoading(true);
      await transcriptionService.startTranscription(interviewId, {
        interviewId,
      });
      await loadTranscription();
      onStartTranscription?.();
    } catch (err: any) {
      setError(err.message || 'Failed to start transcription');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getImportanceColor = (importance: string): string => {
    switch (importance) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentColor = (sentiment: string): string => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading && !transcript) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading transcription...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (!transcript) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Transcription Available
          </h3>
          <p className="text-gray-600 mb-4">
            Start transcription to analyze this interview with AI
          </p>
          <button
            onClick={handleStartTranscription}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Start Transcription
          </button>
        </div>
      </div>
    );
  }

  if (transcript.status === TranscriptStatus.PROCESSING) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Processing Transcription
          </h3>
          <p className="text-gray-600">
            AI is analyzing the interview. This may take a few minutes...
          </p>
        </div>
      </div>
    );
  }

  if (transcript.status === TranscriptStatus.FAILED) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-900 mb-2">
          Transcription Failed
        </h3>
        <p className="text-red-700">
          There was an error processing the transcription. Please try again.
        </p>
        <button
          onClick={handleStartTranscription}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Retry Transcription
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'summary'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('transcript')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'transcript'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Transcript
          </button>
          <button
            onClick={() => setActiveTab('keyPoints')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'keyPoints'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Key Points ({transcript.keyPoints?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('flags')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'flags'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Flags
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'feedback'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Suggested Feedback
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* Sentiment */}
            {transcript.sentimentAnalysis && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Overall Sentiment
                </h3>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(
                      transcript.sentimentAnalysis.overall
                    )}`}
                  >
                    {transcript.sentimentAnalysis.overall.charAt(0).toUpperCase() +
                      transcript.sentimentAnalysis.overall.slice(1)}
                  </span>
                  <span className="text-gray-600">
                    Score: {transcript.sentimentAnalysis.score.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Summary */}
            {transcript.summary && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Interview Summary
                </h3>
                <div className="prose max-w-none text-gray-600">
                  {transcript.summary.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {transcript.keyPoints?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Key Points</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {transcript.greenFlags?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Green Flags</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">
                  {transcript.redFlags?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Red Flags</div>
              </div>
            </div>
          </div>
        )}

        {/* Transcript Tab */}
        {activeTab === 'transcript' && (
          <div className="space-y-4">
            {transcript.segments?.map((segment) => {
              const speaker = transcript.speakers?.find(
                (s) => s.id === segment.speakerId
              );
              return (
                <div key={segment.id} className="flex space-x-3">
                  <div className="flex-shrink-0 text-xs text-gray-500 w-16">
                    {formatTime(segment.startTime)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {speaker?.name || speaker?.role || 'Unknown'}
                    </div>
                    <div className="text-gray-700">{segment.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Key Points Tab */}
        {activeTab === 'keyPoints' && (
          <div className="space-y-3">
            {transcript.keyPoints?.map((point, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getImportanceColor(
                      point.importance
                    )}`}
                  >
                    {point.importance.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(point.timestamp)}
                  </span>
                </div>
                <p className="text-gray-900 mb-1">{point.text}</p>
                <span className="text-xs text-gray-500">{point.category}</span>
              </div>
            ))}
          </div>
        )}

        {/* Flags Tab */}
        {activeTab === 'flags' && (
          <div className="space-y-6">
            {/* Green Flags */}
            {transcript.greenFlags && transcript.greenFlags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Green Flags (Positive Indicators)
                </h3>
                <div className="space-y-3">
                  {transcript.greenFlags.map((flag, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-green-500 bg-green-50 p-4 rounded"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(flag.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-900 mb-2 italic">"{flag.text}"</p>
                      <p className="text-sm text-gray-700">{flag.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Red Flags */}
            {transcript.redFlags && transcript.redFlags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Red Flags (Areas of Concern)
                </h3>
                <div className="space-y-3">
                  {transcript.redFlags.map((flag, index) => (
                    <div
                      key={index}
                      className={`border-l-4 border-red-500 p-4 rounded ${getSeverityColor(
                        flag.severity
                      )}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
                            flag.severity
                          )}`}
                        >
                          {flag.severity.toUpperCase()} SEVERITY
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(flag.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-900 mb-2 italic">"{flag.text}"</p>
                      <p className="text-sm text-gray-700">{flag.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!transcript.greenFlags || transcript.greenFlags.length === 0) &&
              (!transcript.redFlags || transcript.redFlags.length === 0) && (
                <p className="text-gray-500 text-center py-8">
                  No flags detected in this interview
                </p>
              )}
          </div>
        )}

        {/* Suggested Feedback Tab */}
        {activeTab === 'feedback' && (
          <div>
            {transcript.suggestedFeedback ? (
              <div className="prose max-w-none">
                {transcript.suggestedFeedback.split('\n').map((line, index) => (
                  <p key={index} className="mb-3 text-gray-700">
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No suggested feedback available
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
