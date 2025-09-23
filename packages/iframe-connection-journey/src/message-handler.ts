import { DATA_ONE_VALID_ORIGINS } from './lib/constants';
import { 
  JourneyEvent, 
  JourneyEventType, 
  PostMessageData, 
  OnCompleteCallback, 
  OnErrorCallback, 
  OnExitCallback 
} from './types';
import { IframeOverlay } from './iframe-overlay';

/**
 * MessageHandler class manages postMessage communication with the iframe
 */
export class MessageHandler {
  private sessionId: string;
  private onComplete?: OnCompleteCallback;
  private onError?: OnErrorCallback;
  private onExit?: OnExitCallback;
  private messageListener: ((event: MessageEvent) => void) | null = null;
  private isListening = false;
  private iframeWindow: HTMLIFrameElement | null = null;
  private overlay: IframeOverlay;
  private close: () => void;

  constructor(
    sessionId: string,
    iframeWindow: HTMLIFrameElement | null,
    close: () => void,
    overlay: IframeOverlay,
    onComplete?: OnCompleteCallback,
    onError?: OnErrorCallback,
    onExit?: OnExitCallback,
  ) {
    this.sessionId = sessionId;
    this.onComplete = onComplete;
    this.onError = onError;
    this.onExit = onExit;
    this.iframeWindow = iframeWindow;
    this.overlay = overlay;
    this.close = close;
  }

  /**
   * Start listening for messages from the iframe
   */
  startListening(): void {
    if (this.isListening) {
      return;
    }

    this.messageListener = this.handleMessage.bind(this);
    window.addEventListener('message', this.messageListener);
    this.isListening = true;
  }

  /**
   * Stop listening for messages
   */
  stopListening(): void {
    if (!this.isListening || !this.messageListener) {
      return;
    }

    window.removeEventListener('message', this.messageListener);
    this.messageListener = null;
    this.isListening = false;
  }

  /**
   * Handle incoming messages from the iframe
   */
  private handleMessage(event: MessageEvent): void {
    try {
      // Validate message origin and structure
      if (!this.isValidMessage(event, this.iframeWindow, this.sessionId)) {
        return;
      }

      const messageData = event.data as PostMessageData;

      // Process the message based on type
      this.processMessage(messageData);

    } catch (error) {
      console.warn('D·One Iframe Journey: Error processing message', error);
    }
  }

  /**
   * Validate if the message is from a trusted source and has correct structure
   */
  private isValidMessage(event: MessageEvent, iframeWindow: HTMLIFrameElement | null, sessionId: string): boolean {
    // Check if message is from a trusted origin
    if (!DATA_ONE_VALID_ORIGINS.includes(event.origin)) return false;

    // Check if message is from a trusted source
    if (iframeWindow && event.source !== iframeWindow.contentWindow) return false;

    // Check if message is for this session
    if (event.data.sessionId !== sessionId) return false;

    // Check if message has expected structure
    if (!event.data || typeof event.data !== 'object') return false;

    const data = event.data as PostMessageData;
    
    // Validate required fields
    if (!data.type || !data.sessionId || typeof data.timestamp !== 'number') return false;

    // Validate event type
    const validTypes: JourneyEventType[] = ['complete', 'error', 'exit'];
    if (!validTypes.includes(data.type)) return false;

    return true;
  }

  /**
   * Process the validated message
   */
  private processMessage(messageData: PostMessageData): void {
    const journeyEvent: JourneyEvent = {
      type: messageData.type,
      sessionId: messageData.sessionId,
      data: messageData.data,
      timestamp: messageData.timestamp
    };

    switch (messageData.type) {
      case 'complete':
        this.handleComplete(journeyEvent);
        break;
      case 'error':
        this.handleError(journeyEvent);
        break;
      case 'exit':
        this.handleExit(journeyEvent);
        break;
      default:
        console.warn('D·One Iframe Journey: Unknown message type', messageData.type);
    }
  }

  /**
   * Handle complete event
   */
  private handleComplete(event: JourneyEvent): void {
    if (this.onComplete) {
      try {
        this.onComplete(event.data);
      } catch (error) {
        console.error('D·One Iframe Journey: Error in onComplete callback', error);
      }
    } else {
      // window.parent.location.href = event.data.redirectURL;
    }
    
    // Once session is complete, close and destroy the overlay
    this.close()
    setTimeout(() => {
      this.overlay?.destroy();
    }, 300);
  }

  /**
   * Handle error event
   */
  private handleError(event: JourneyEvent): void {
    if (this.onError) {
      try {
        let error;

        if (event.data instanceof Error) {
          error = event.data;
        } else if (event.data.error) {
          error = event.data.error;
        } else if (typeof event.data === 'string') {
          error = new Error(event.data);
        } else {
          error = new Error('Unknown error');
        }

        this.onError(error);
      } catch (error) {
        console.error('D·One Iframe Journey: Error in onError callback', error);
      }
    }
  }

  /**
   * Handle exit event
   */
  private handleExit(event: JourneyEvent): void {
    if (this.onExit) {
      try {
        this.onExit();
      } catch (error) {
        console.error('D·One Iframe Journey: Error in onExit callback', error);
      }
    }
    
    this.close();
  }

  /**
   * Send a message to the iframe
   */
  sendMessage(iframe: HTMLIFrameElement, type: JourneyEventType, data?: any): void {
    if (!iframe.contentWindow) {
      console.warn('D·One Iframe Journey: Cannot send message, iframe contentWindow not available');
      return;
    }

    const message: PostMessageData = {
      type,
      sessionId: this.sessionId,
      data,
      timestamp: Date.now()
    };

    try {
      iframe.contentWindow.postMessage(message, DATA_ONE_VALID_ORIGINS[0]);
    } catch (error) {
      console.error('D·One Iframe Journey: Error sending message to iframe', error);
    }
  }

  /**
   * Check if currently listening for messages
   */
  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  /**
   * Get the session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
}
