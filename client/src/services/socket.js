class SocketManager {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectInterval = null;
    this.isConnecting = false;
    this.onConnectionChange = null;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // Detect if running locally (localhost or 127.0.0.1)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      // Development: backend is always on port 5000
      this.url = `${protocol}://localhost:5000/ws`;
    } else {
      // Production: use same host as frontend
      this.url = `${protocol}://${window.location.host}/ws`;
    }
  }

  setConnectionCallback(cb) {
    this.onConnectionChange = cb;
  }

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        this.isConnecting = false;
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
        if (this.onConnectionChange) this.onConnectionChange(true);
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const type = message.type;
          const handlers = this.listeners.get(type);
          if (handlers) {
            handlers.forEach((cb) => cb(message.data));
          }
          // Global wildcards
          const allHandlers = this.listeners.get('*');
          if (allHandlers) {
            allHandlers.forEach((cb) => cb(message));
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      this.socket.onclose = () => {
        this.isConnecting = false;
        if (this.onConnectionChange) this.onConnectionChange(false);
        this.scheduleReconnect();
      };

      this.socket.onerror = () => {
        this.isConnecting = false;
        if (this.onConnectionChange) this.onConnectionChange(false);
      };
    } catch (err) {
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (!this.reconnectInterval) {
      this.reconnectInterval = setInterval(() => {
        this.connect();
      }, 3000);
    }
  }

  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)?.add(callback);

    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  isConnected() {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

export const socketManager = new SocketManager();
