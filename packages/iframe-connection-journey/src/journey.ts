import { 
  JourneyConfig, 
  JourneyInstance, 
  JourneyStatus 
} from './types';
import { IframeOverlay } from './iframe-overlay';
import { MessageHandler } from './message-handler';
import { DATA_ONE_VALID_ORIGINS } from './lib/constants';

/**
 * Journey class manages the complete iframe connection journey lifecycle
 */
export class Journey implements JourneyInstance {
  public status: JourneyStatus = 'initialising';
  private overlay: IframeOverlay;
  private messageHandler: MessageHandler;
  private config: JourneyConfig;
  private isStarted = false;

  constructor(config: JourneyConfig) {
    this.config = config;
    this.overlay = new IframeOverlay();
    this.messageHandler = new MessageHandler(
      config.sessionId,
      this.overlay.getIframe()!,
      this.close.bind(this),
      this.overlay,
      config.onComplete,
      config.onError,
      config.onExit,
    );

    this.initialize();
  }

  /**
   * Initialize the journey by creating the overlay and iframe
   */
  private initialize(): void {
    try {
      // Validate configuration
      this.validateConfig();

      // Create the overlay with loading spinner
      this.overlay.create(this.config.connectionUrl, this.config.sessionId);

      // Set status to ready
      this.status = 'ready';

    } catch (error) {
      this.status = 'initialising';
      if (this.config.onError) {
        this.config.onError(error instanceof Error ? error : new Error(String(error)));
      }
      throw error;
    }
  }

  /**
   * Start the journey by showing the overlay and starting message listening
   */
  start(): void {
    if (this.status !== 'ready') {
      throw new Error('Journey is not ready. Current status: ' + this.status);
    }

    if (this.isStarted) {
      console.warn('D·One Iframe Journey: Journey is already started');
      return;
    }

    try {
      // Show the overlay with loading spinner
      this.overlay.show();

      // Start listening for messages
      this.messageHandler.startListening();

      this.isStarted = true;

    } catch (error) {
      if (this.config.onError) {
        this.config.onError(error instanceof Error ? error : new Error(String(error)));
      }
      throw error;
    }
  }

  /**
   * Close the journey by hiding the overlay and cleaning up
   */
  close(): void {
    try {
      // Stop listening for messages
      this.messageHandler.stopListening();

      // Hide the overlay
      this.overlay.hide();

      this.isStarted = false;

    } catch (error) {
      console.error('D·One Iframe Journey: Error closing journey', error);
    }
  }

  /**
   * Remove the journey by hiding the overlay and cleaning up
   */
  remove(): void {
    this.close();
    setTimeout(() => {
      this.overlay.destroy();
    }, 300);
  }


  /**
   * Validate the journey configuration
   */
  private validateConfig(): void {
    if (!this.config.connectionUrl) {
      throw new Error('connectionUrl is required');
    }

    if (!this.config.sessionId) {
      throw new Error('sessionId is required');
    }

    // Validate URL
    try {
        const url = new URL(this.config.connectionUrl);

        // Validate origin
        if (!DATA_ONE_VALID_ORIGINS.includes(url.origin)) {
            throw new Error('connectionUrl must be a valid D·One connection URL');
        }
        
        const token = url.searchParams.get('token');

        // Validate token parameter
        if (!token || token.trim().length === 0) {
            throw new Error('connectionUrl must have a token parameter');
        }
    } catch {
        throw new Error('connectionUrl must be a valid URL');
    }

    // Validate sessionId format (should be non-empty string)
    if (typeof this.config.sessionId !== 'string' || this.config.sessionId.trim().length === 0) {
      throw new Error('sessionId must be a non-empty string');
    }
  }

  /**
   * Check if the journey is currently started
   */
  getIsStarted(): boolean {
    return this.isStarted;
  }

  /**
   * Get the iframe element (for advanced use cases)
   */
  getIframe(): HTMLIFrameElement | null {
    return this.overlay.getIframe();
  }

  /**
   * Get the session ID
   */
  getSessionId(): string {
    return this.config.sessionId;
  }

  /**
   * Check if overlay is visible
   */
  isVisible(): boolean {
    return this.overlay.isOverlayVisible();
  }
}
