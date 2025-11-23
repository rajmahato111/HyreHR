import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, X, Check } from 'lucide-react';
import {
  generateOutreachEmail,
  generateResponseEmail,
  generateRejectionEmail,
  getEmailTones,
  EmailTone,
  EmailToneOption,
} from '../../services/ai';

interface AIEmailAssistantProps {
  candidateId: string;
  applicationId?: string;
  jobId?: string;
  emailType?: 'outreach' | 'response' | 'rejection';
  onGenerated?: (content: { subject: string; body: string }) => void;
  onClose?: () => void;
}

export const AIEmailAssistant: React.FC<AIEmailAssistantProps> = ({
  candidateId,
  applicationId,
  jobId,
  emailType = 'response',
  onGenerated,
  onClose,
}) => {
  const [tone, setTone] = useState<EmailTone>('professional');
  const [tones, setTones] = useState<EmailToneOption[]>([]);
  const [additionalContext, setAdditionalContext] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    subject: string;
    body: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadTones();
  }, []);

  const loadTones = async () => {
    try {
      const data = await getEmailTones();
      setTones(data);
    } catch (err) {
      console.error('Failed to load tones:', err);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);

    try {
      let generated;

      if (emailType === 'outreach' && jobId) {
        generated = await generateOutreachEmail({
          candidateId,
          jobId,
          tone,
          additionalContext: additionalContext || undefined,
        });
      } else if (emailType === 'rejection' && applicationId) {
        generated = await generateRejectionEmail({
          applicationId,
          tone,
        });
      } else {
        generated = await generateResponseEmail({
          candidateEmail: '',
          candidateId,
          applicationId,
          tone,
          context: additionalContext || undefined,
        });
      }

      setGeneratedContent(generated);
      setShowPreview(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate email');
    } finally {
      setGenerating(false);
    }
  };

  const handleAccept = () => {
    if (generatedContent && onGenerated) {
      onGenerated(generatedContent);
      setShowPreview(false);
      setGeneratedContent(null);
    }
  };

  const handleRegenerate = async () => {
    setShowPreview(false);
    await handleGenerate();
  };

  if (showPreview && generatedContent) {
    return (
      <div className="bg-white rounded-lg border shadow-lg">
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">AI Generated Email</h3>
          </div>
          <button
            onClick={() => setShowPreview(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-medium mb-1">✨ Generated with AI</p>
            <p className="text-xs">
              Review the content and choose to use it or regenerate with different settings.
            </p>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Subject:</div>
            <div className="bg-gray-50 border rounded-lg p-3 text-sm">
              {generatedContent.subject}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Body:</div>
            <div className="bg-gray-50 border rounded-lg p-3 whitespace-pre-wrap text-sm max-h-64 overflow-y-auto">
              {generatedContent.body}
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-sm font-medium text-purple-900 mb-1">Tone:</div>
            <div className="text-sm text-purple-700 capitalize">{tone}</div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <button
            onClick={handleRegenerate}
            disabled={generating}
            className="flex items-center gap-2 px-3 py-2 text-sm text-purple-700 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Regenerating...' : 'Regenerate'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(false)}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleAccept}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              <Check className="w-4 h-4" />
              Use This Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">AI Email Generator</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Tone Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Tone
          </label>
          <div className="grid grid-cols-3 gap-2">
            {tones.map((toneOption) => (
              <button
                key={toneOption.value}
                onClick={() => setTone(toneOption.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tone === toneOption.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {toneOption.label}
              </button>
            ))}
          </div>
          {tones.find((t) => t.value === tone) && (
            <p className="text-xs text-gray-600 mt-1">
              {tones.find((t) => t.value === tone)?.description}
            </p>
          )}
        </div>

        {/* Additional Context */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Context (Optional)
          </label>
          <textarea
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            placeholder="Add any specific details you want to include..."
            rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          {generating ? 'Generating...' : 'Generate Email with AI'}
        </button>
      </div>
    </div>
  );
};
