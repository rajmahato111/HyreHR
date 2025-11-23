import axios from 'axios';

const API_BASE_URL = '/api/v1';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    type: 'text' | 'job_draft' | 'data_query' | 'error';
    content: string;
    metadata?: Record<string, any>;
    createdAt: string;
}

export interface ChatConversation {
    id: string;
    title: string;
    lastMessageAt?: string;
    createdAt: string;
    messages?: ChatMessage[];
}

export interface SendMessageResponse {
    success: boolean;
    data: {
        conversation: {
            id: string;
            title: string;
            createdAt?: string;
        };
        message: ChatMessage;
    };
}

export interface ConversationsResponse {
    success: boolean;
    data: ChatConversation[];
}

export interface ConversationResponse {
    success: boolean;
    data: ChatConversation;
}

const chatApi = {
    sendMessage: async (
        message: string,
        conversationId?: string,
    ): Promise<SendMessageResponse> => {
        const response = await axios.post<SendMessageResponse>(
            `${API_BASE_URL}/ai/chat/message`,
            {
                message,
                conversationId,
            },
        );
        return response.data;
    },

    getConversations: async (): Promise<ConversationsResponse> => {
        const response = await axios.get<ConversationsResponse>(
            `${API_BASE_URL}/ai/chat/conversations`,
        );
        return response.data;
    },

    getConversation: async (id: string): Promise<ConversationResponse> => {
        const response = await axios.get<ConversationResponse>(
            `${API_BASE_URL}/ai/chat/conversations/${id}`,
        );
        return response.data;
    },

    deleteConversation: async (id: string): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/ai/chat/conversations/${id}`);
    },
};

export default chatApi;
