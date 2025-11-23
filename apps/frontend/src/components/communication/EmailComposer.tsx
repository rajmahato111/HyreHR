import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Paperclip,
  FileText,
  ChevronDown,
  Eye,
  Trash2,
  Sparkles,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import {
  sendEmail,
  getEmailTemplates,
  getEmailTemplateById,
  previewEmailTemplate,
  EmailTemplate,
  SendEmailDto,
} from '../../services/communication';
import {
  generateOutreachEmail,
  generateResponseEmail,
  generateRejectionEmail,
  getEmailTones,
  EmailTone,
  EmailToneOption,
} from '../../services/ai';

interface EmailComposerProps {
  candidateId: string;
  applicationId?: string;
  jobId?: string;
  defaultTo?: string[];
  defaultSubject?: string;
  defaultBody?: string;
  emailType?: 'outreach' | 'response' | 'rejection';
  onClose: () => void;
  onSent?: () => void;
}

export const EmailComposer: React.FC<EmailComposerProps> = ({
  candidateId,
  applicationId,
  jobId,
  defaultTo = [],
  defaultSubject = '',
  defaultBody = '',
  emailType,
  onClose,
  onSent,
}) => {
  const [toEmails, setToEmails] = useState<string[]>(defaultTo);
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [bccEmails, setBccEmails] = useState<string[]>([]);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState<{ subject: string; body: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Input states for email chips
  const [toInput, setToInput] = useState('');
  const [ccInput, setCcInput] = useState('');
  const [bccInput, setBccInput] = useState('');

  // AI Assistant states
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiTone, setAiTone] = useState<EmailTone>('professional');
  const [aiTones, setAiTones] = useState<EmailToneOption[]>([]);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState<{ subject: string; body: string } | null>(null);
  const [showAIPreview, setShowAIPreview] = useState(false);
  const [aiAdditionalContext, setAiAdditionalContext] = useState('');

  useEffect(() => {
    loadTemplates();
    loadAITones();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await getEmailTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const loadAITones = async () => {
    try {
      const tones = await getEmailTones();
      setAiTones(tones);
    } catch (err) {
      console.error('Failed to load AI tones:', err);
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    if (!templateId) {
      setSelectedTemplateId('');
      return;
    }

    try {
      const template = await getEmailTemplateById(templateId);
      setSelectedTemplateId(templateId);
      setSubject(template.subject);
      setBody(template.body);
      setShowTemplates(false);
    } catch (err) {
      setError('Failed to load template');
    }
  };

  const handlePreview = async () => {
    if (!selectedTemplateId) {
      setPreviewContent({ subject, body });
      setShowPreview(true);
      return;
    }

    try {
      const variables = {
        candidateName: 'John Doe', // This should come from candidate data
        jobTitle: 'Software Engineer', // This should come from job data
        companyName: 'Acme Corp',
      };
      const preview = await previewEmailTemplate(selectedTemplateId, variables);
      setPreviewContent(preview);
      setShowPreview(true);
    } catch (err) {
      setError('Failed to preview template');
    }
  };

  const handleAddEmail = (
    email: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const trimmedEmail = email.trim();
    if (trimmedEmail && isValidEmail(trimmedEmail) && !list.includes(trimmedEmail)) {
      setList([...list, trimmedEmail]);
      setInput('');
    }
  };

  const handleRemoveEmail = (
    email: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList(list.filter((e) => e !== email));
  };

  const handleEmailInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    input: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      handleAddEmail(input, list, setList, setInput);
    } else if (e.key === 'Backspace' && !input && list.length > 0) {
      setList(list.slice(0, -1));
    }
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleGenerateAIEmail = async () => {
    setAiGenerating(true);
    setError(null);

    try {
      let generated;

      if (emailType === 'outreach' && jobId) {
        generated = await generateOutreachEmail({
          candidateId,
          jobId,
          tone: aiTone,
          additionalContext: aiAdditionalContext || undefined,
        });
      } else if (emailType === 'rejection' && applicationId) {
        generated = await generateRejectionEmail({
          applicationId,
          tone: aiTone,
        });
      } else if (emailType === 'response') {
        generated = await generateResponseEmail({
          candidateEmail: toEmails[0] || '',
          candidateId,
          applicationId,
          tone: aiTone,
          context: aiAdditionalContext || undefined,
        });
      } else {
        // Default to response type
        generated = await generateResponseEmail({
          candidateEmail: toEmails[0] || '',
          candidateId,
          applicationId,
          tone: aiTone,
          context: aiAdditionalContext || undefined,
        });
      }

      setAiGeneratedContent(generated);
      setShowAIPreview(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate email with AI');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAcceptAIContent = () => {
    if (aiGeneratedContent) {
      setSubject(aiGeneratedContent.subject);
      setBody(aiGeneratedContent.body);
      setShowAIPreview(false);
      setShowAIAssistant(false);
      setAiGeneratedContent(null);
    }
  };

  const handleEditAIContent = () => {
    if (aiGeneratedContent) {
      setSubject(aiGeneratedContent.subject);
      setBody(aiGeneratedContent.body);
      setShowAIPreview(false);
      setShowAIAssistant(false);
      setAiGeneratedContent(null);
    }
  };

  const handleRegenerateAIEmail = async () => {
    setShowAIPreview(false);
    await handleGenerateAIEmail();
  };

  const handleSend = async () => {
    if (toEmails.length === 0) {
      setError('Please add at least one recipient');
      return;
    }

    if (!subject.trim()) {
      setError('Please add a subject');
      return;
    }

    if (!body.trim()) {
      setError('Please add a message');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dto: SendEmailDto = {
        candidateId,
        applicationId,
        toEmails,
        ccEmails: ccEmails.length > 0 ? ccEmails : undefined,
        bccEmails: bccEmails.length > 0 ? bccEmails : undefined,
        subject,
        body,
        templateId: selectedTemplateId || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      await sendEmail(dto);
      onSent?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">New Email</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Template Selection and AI Assistant */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <FileText className="w-4 h-4" />
                Use Template
                <ChevronDown className="w-4 h-4" />
              </button>

              {showTemplates && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <button
                      onClick={() => handleTemplateSelect('')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                    >
                      No Template
                    </button>
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.id)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                      >
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-gray-500">{template.category}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowAIAssistant(!showAIAssistant)}
              className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              <Sparkles className="w-4 h-4" />
              AI Assistant
            </button>
          </div>

          {/* AI Assistant Panel */}
          {showAIAssistant && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">AI Email Generator</h3>
                </div>
                <button
                  onClick={() => setShowAIAssistant(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Tone Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Tone
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {aiTones.map((tone) => (
                      <button
                        key={tone.value}
                        onClick={() => setAiTone(tone.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          aiTone === tone.value
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {tone.label}
                      </button>
                    ))}
                  </div>
                  {aiTones.find((t) => t.value === aiTone) && (
                    <p className="text-xs text-gray-600 mt-1">
                      {aiTones.find((t) => t.value === aiTone)?.description}
                    </p>
                  )}
                </div>

                {/* Additional Context */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Context (Optional)
                  </label>
                  <textarea
                    value={aiAdditionalContext}
                    onChange={(e) => setAiAdditionalContext(e.target.value)}
                    placeholder="Add any specific details you want to include in the email..."
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateAIEmail}
                  disabled={aiGenerating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  {aiGenerating ? 'Generating...' : 'Generate Email with AI'}
                </button>
              </div>
            </div>
          )}

          {/* To Field */}
          <div className="flex items-start gap-2">
            <label className="text-sm font-medium text-gray-700 pt-2 w-16">To:</label>
            <div className="flex-1 border rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-500">
              <div className="flex flex-wrap gap-2">
                {toEmails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                  >
                    {email}
                    <button
                      onClick={() => handleRemoveEmail(email, toEmails, setToEmails)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  onKeyDown={(e) => handleEmailInputKeyDown(e, toInput, toEmails, setToEmails, setToInput)}
                  onBlur={() => {
                    if (toInput) handleAddEmail(toInput, toEmails, setToEmails, setToInput);
                  }}
                  placeholder={toEmails.length === 0 ? 'Add recipients...' : ''}
                  className="flex-1 min-w-[200px] outline-none text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCc(!showCc)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Cc
              </button>
              <button
                onClick={() => setShowBcc(!showBcc)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Bcc
              </button>
            </div>
          </div>

          {/* Cc Field */}
          {showCc && (
            <div className="flex items-start gap-2">
              <label className="text-sm font-medium text-gray-700 pt-2 w-16">Cc:</label>
              <div className="flex-1 border rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-500">
                <div className="flex flex-wrap gap-2">
                  {ccEmails.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
                    >
                      {email}
                      <button
                        onClick={() => handleRemoveEmail(email, ccEmails, setCcEmails)}
                        className="hover:text-gray-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={ccInput}
                    onChange={(e) => setCcInput(e.target.value)}
                    onKeyDown={(e) => handleEmailInputKeyDown(e, ccInput, ccEmails, setCcEmails, setCcInput)}
                    onBlur={() => {
                      if (ccInput) handleAddEmail(ccInput, ccEmails, setCcEmails, setCcInput);
                    }}
                    placeholder={ccEmails.length === 0 ? 'Add Cc recipients...' : ''}
                    className="flex-1 min-w-[200px] outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bcc Field */}
          {showBcc && (
            <div className="flex items-start gap-2">
              <label className="text-sm font-medium text-gray-700 pt-2 w-16">Bcc:</label>
              <div className="flex-1 border rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-500">
                <div className="flex flex-wrap gap-2">
                  {bccEmails.map((email) => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
                    >
                      {email}
                      <button
                        onClick={() => handleRemoveEmail(email, bccEmails, setBccEmails)}
                        className="hover:text-gray-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={bccInput}
                    onChange={(e) => setBccInput(e.target.value)}
                    onKeyDown={(e) => handleEmailInputKeyDown(e, bccInput, bccEmails, setBccEmails, setBccInput)}
                    onBlur={() => {
                      if (bccInput) handleAddEmail(bccInput, bccEmails, setBccEmails, setBccInput);
                    }}
                    placeholder={bccEmails.length === 0 ? 'Add Bcc recipients...' : ''}
                    className="flex-1 min-w-[200px] outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Subject Field */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 w-16">Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Body Field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Message:</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              rows={12}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Attachments:</label>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveAttachment(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                <Paperclip className="w-4 h-4" />
                Attach Files
              </div>
            </label>
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={loading || toEmails.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Email Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Subject:</div>
                <div className="text-base">{previewContent.subject}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Body:</div>
                <div className="whitespace-pre-wrap text-base">{previewContent.body}</div>
              </div>
            </div>
            <div className="flex justify-end p-4 border-t">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generated Email Preview Modal */}
      {showAIPreview && aiGeneratedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold">AI Generated Email</h3>
              </div>
              <button
                onClick={() => setShowAIPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <p className="font-medium mb-1">✨ Generated with AI</p>
                <p className="text-xs">
                  Review the content below and choose to use it as-is, edit it, or regenerate with different settings.
                </p>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Subject:</div>
                <div className="bg-gray-50 border rounded-lg p-3 text-base">
                  {aiGeneratedContent.subject}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Body:</div>
                <div className="bg-gray-50 border rounded-lg p-4 whitespace-pre-wrap text-base max-h-96 overflow-y-auto">
                  {aiGeneratedContent.body}
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="text-sm font-medium text-purple-900 mb-1">Tone Used:</div>
                <div className="text-sm text-purple-700 capitalize">{aiTone}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <button
                onClick={handleRegenerateAIEmail}
                disabled={aiGenerating}
                className="flex items-center gap-2 px-4 py-2 text-sm text-purple-700 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${aiGenerating ? 'animate-spin' : ''}`} />
                {aiGenerating ? 'Regenerating...' : 'Regenerate'}
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAIPreview(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditAIContent}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit & Use
                </button>
                <button
                  onClick={handleAcceptAIContent}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Use This Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
