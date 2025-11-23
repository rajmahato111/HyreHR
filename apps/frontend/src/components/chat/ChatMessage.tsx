import { User, Bot, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { ChatMessage } from '../../api/chatApi';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
    message: ChatMessage;
}

export default function ChatMessageComponent({ message }: ChatMessageProps) {
    const [copied, setCopied] = useState(false);

    const isUser = message.role === 'user';

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3`}>
            {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                </div>
            )}

            <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : message.type === 'error'
                            ? 'bg-red-500/20 text-red-200 border border-red-500/30'
                            : 'bg-white/5 text-gray-200 border border-white/10'
                    }`}
            >
                {isUser ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                ) : (
                    <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown
                            components={{
                                p: ({ children }) => (
                                    <p className="mb-2 last:mb-0">{children}</p>
                                ),
                                ul: ({ children }) => (
                                    <ul className="list-disc list-inside mb-2 space-y-1">
                                        {children}
                                    </ul>
                                ),
                                ol: ({ children }) => (
                                    <ol className="list-decimal list-inside mb-2 space-y-1">
                                        {children}
                                    </ol>
                                ),
                                strong: ({ children }) => (
                                    <strong className="font-semibold text-white">
                                        {children}
                                    </strong>
                                ),
                                code: ({ children }) => (
                                    <code className="bg-black/30 px-1 py-0.5 rounded text-xs">
                                        {children}
                                    </code>
                                ),
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                )}

                {!isUser && message.type !== 'error' && (
                    <button
                        onClick={handleCopy}
                        className="mt-2 text-xs text-gray-400 hover:text-white flex items-center space-x-1 transition-colors"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3 h-3" />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                )}

                {message.type === 'job_draft' && message.metadata?.jobDraft && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                        <button className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors">
                            Create This Job Post
                        </button>
                    </div>
                )}
            </div>

            {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-300" />
                </div>
            )}
        </div>
    );
}
