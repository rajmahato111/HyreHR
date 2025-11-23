import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect() {
    if (this.socket?.connected) {
      return;
    }

    const token = localStorage.getItem('accessToken');
    
    this.socket = io(WS_URL, {
      auth: {
        token,
      },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Handle incoming events
    this.socket.onAny((event, data) => {
      const listeners = this.listeners.get(event);
      if (listeners) {
        listeners.forEach((callback) => callback(data));
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(channel: string, filters?: Record<string, any>) {
    if (!this.socket) {
      this.connect();
    }

    this.socket?.emit('subscribe', {
      channel,
      filters,
    });
  }

  unsubscribe(channel: string) {
    this.socket?.emit('unsubscribe', {
      channel,
    });
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
