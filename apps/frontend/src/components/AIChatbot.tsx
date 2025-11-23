import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import chatApi, { ChatMessage, ChatConversation } from '../api/chatApi';
import ChatMessageComponent from './chat/ChatMessage';

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentConversation, setCurrentConversation] =
        useState<ChatConversation | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Add welcome message when first opened
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: 'welcome',
                    role: 'assistant',
                    type: 'text',
                    content: `Hi! I'm your HyreHR AI Assistant. I can help you with:

• Creating job post drafts
• Querying jobs, candidates, and applications
• Providing recruiting insights

How can I help you today?`,
                    createdAt: new Date().toISOString(),
                },
            ]);
        }
    }, [isOpen]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            role: 'user',
            type: 'text',
            content: inputMessage,
            createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await chatApi.sendMessage(
                inputMessage,
                currentConversation?.id,
            );

            setCurrentConversation({
                ...response.data.conversation,
                createdAt: response.data.conversation.createdAt || new Date().toISOString(),
            } as ChatConversation);
            setMessages((prev) => [...prev, response.data.message]);
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages((prev) => [
                ...prev,
                {
                    id: `error-${Date.now()}`,
                    role: 'assistant',
                    type: 'error',
                    content:
                        'Sorry, I encountered an error processing your request. Please try again.',
                    createdAt: new Date().toISOString(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleNewConversation = () => {
        setCurrentConversation(null);
        setMessages([
            {
                id: 'welcome',
                role: 'assistant',
                type: 'text',
                content: `Hi! I'm your HyreHR AI Assistant. How can I help you today?`,
                createdAt: new Date().toISOString(),
            },
        ]);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 group"
                aria-label="Open AI Chat"
            >
                <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] bg-[#0F0F14] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-white/10">
                <div className="flex items-center space-x-2">
                    <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">HyreHR AI</h3>
                        <p className="text-xs text-gray-400">Your recruiting assistant</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleNewConversation}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs"
                    >
                        New Chat
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <ChatMessageComponent key={message.id} message={message} />
                ))}
                {isLoading && (
                    <div className="flex items-center space-x-2 text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">AI is thinking...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-[#0A0A0F]">
                <div className="flex items-end space-x-2">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything..."
                        rows={1}
                        className="flex-1 bg-white/5 text-white placeholder-gray-500 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
