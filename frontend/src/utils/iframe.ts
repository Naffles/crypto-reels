// Iframe communication utilities for Naffles platform integration

export interface IframeMessage {
  type: string;
  data?: any;
  source: 'crypto-reels';
}

export interface NafflesMessage {
  type: string;
  data?: any;
  source: 'naffles';
}

export class IframeMessenger {
  private parentOrigin: string;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  constructor() {
    this.parentOrigin = process.env.NAFFLES_FRONTEND_URL || 'http://localhost:3000';
    this.setupMessageListener();
  }

  private setupMessageListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.handleMessage.bind(this));
    }
  }

  private handleMessage(event: MessageEvent<NafflesMessage>) {
    // Verify origin for security
    if (event.origin !== this.parentOrigin) {
      console.warn('Received message from unauthorized origin:', event.origin);
      return;
    }

    const { type, data, source } = event.data;
    
    if (source !== 'naffles') {
      return;
    }

    const handler = this.messageHandlers.get(type);
    if (handler) {
      handler(data);
    }
  }

  // Send message to parent Naffles frame
  sendToParent(type: string, data?: any) {
    if (typeof window !== 'undefined' && window.parent) {
      const message: IframeMessage = {
        type,
        data,
        source: 'crypto-reels'
      };
      
      window.parent.postMessage(message, this.parentOrigin);
    }
  }

  // Register message handler
  onMessage(type: string, handler: (data: any) => void) {
    this.messageHandlers.set(type, handler);
  }

  // Remove message handler
  offMessage(type: string) {
    this.messageHandlers.delete(type);
  }

  // Notify parent about game events
  notifyGameInitialized(gameId: string) {
    this.sendToParent('game:initialized', { gameId });
  }

  notifyGameStarted(gameId: string, betAmount: number) {
    this.sendToParent('game:started', { gameId, betAmount });
  }

  notifyGameCompleted(gameId: string, result: any) {
    this.sendToParent('game:completed', { gameId, result });
  }

  notifyBalanceChanged(newBalance: number, currency: string) {
    this.sendToParent('balance:changed', { balance: newBalance, currency });
  }

  notifyError(error: string, details?: any) {
    this.sendToParent('error', { error, details });
  }

  // Request data from parent
  requestPlayerData() {
    this.sendToParent('request:player-data');
  }

  requestBalance() {
    this.sendToParent('request:balance');
  }

  requestNFTCollection() {
    this.sendToParent('request:nft-collection');
  }

  // Utility methods
  isInIframe(): boolean {
    if (typeof window === 'undefined') return false;
    return window.self !== window.top;
  }

  getParentOrigin(): string {
    return this.parentOrigin;
  }

  // Resize iframe to fit content
  resizeIframe(height?: number) {
    if (height) {
      this.sendToParent('resize', { height });
    } else if (typeof document !== 'undefined') {
      const bodyHeight = document.body.scrollHeight;
      this.sendToParent('resize', { height: bodyHeight });
    }
  }
}

// Default messenger instance
export const iframeMessenger = new IframeMessenger();

// Utility functions
export const setupIframeIntegration = () => {
  if (typeof window === 'undefined') return;

  // Auto-resize on content changes
  const resizeObserver = new ResizeObserver(() => {
    iframeMessenger.resizeIframe();
  });

  if (document.body) {
    resizeObserver.observe(document.body);
  }

  // Handle common iframe events
  iframeMessenger.onMessage('player:data', (data) => {
    console.log('Received player data:', data);
    // Store player data in app state
  });

  iframeMessenger.onMessage('balance:update', (data) => {
    console.log('Balance updated:', data);
    // Update balance in app state
  });

  iframeMessenger.onMessage('nft:collection', (data) => {
    console.log('NFT collection received:', data);
    // Update NFT collection in app state
  });

  // Notify parent that iframe is ready
  iframeMessenger.sendToParent('iframe:ready');
};

export const cleanupIframeIntegration = () => {
  // Clean up event listeners if needed
  if (typeof window !== 'undefined') {
    window.removeEventListener('message', () => {});
  }
};