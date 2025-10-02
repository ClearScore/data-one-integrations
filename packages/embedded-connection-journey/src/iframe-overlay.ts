import { DATA_ONE_VALID_ORIGINS } from './lib/constants';
import { IframeConfig, SandboxPermission } from './types';

/**
 * CSS styles for the overlay and iframe
 */
const OVERLAY_STYLES = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
  pointer-events: auto;
  z-index: -1;
`;

const SPINNER_ANIMATION = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const CONTAINER_STYLES = `
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 90%;
    max-width: 440px;
    height: 90%;
    max-height: 640px;
    background-color: white;
    border-radius: 16px;
`;

const SPINNER_STYLES = `
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #263648;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
`;

const LOADING_TEXT_STYLES = `
    margin-top: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    color: #666;
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
`;

const IFRAME_STYLES = `
  width: 100%;
  height: 100%;
  border: none;
  transition: opacity 0.3s ease-in-out 0.15s;
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 16px;
`;

const IFRAME_VISIBLE_STYLES = `
  opacity: 1;
`;

const OVERLAY_VISIBLE_STYLES = `
  opacity: 1;
  z-index: 2147483647;
`;

const OVERLAY_HIDDEN_STYLES = `
  opacity: 0;
  z-index: -1;
`;

const SPINNER_VISIBLE_STYLES = `
  opacity: 0;
`;

/**
 * IframeOverlay class handles the creation and management of the iframe overlay
 */
export class IframeOverlay {
    private overlay: HTMLDivElement | null = null;
    private container: HTMLDivElement | null = null;
    private spinner: HTMLDivElement | null = null;
    private loadingText: HTMLDivElement | null = null;
    private iframe: HTMLIFrameElement | null = null;
    private isVisible = false;
    private bodyScrollStyle = document.body.style.overflow;
    private animationStyle: HTMLStyleElement | null = null;

    /**
     * Create the overlay and iframe elements with loading spinner
     */
    create(connectionUrl: string, sessionId: string): void {
        // Inject spinner animation CSS
        this.injectSpinnerAnimation();

        // Create overlay container
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = OVERLAY_STYLES;
        this.overlay.setAttribute('data-dataone-overlay', 'true');

        // Create loading spinner container
        this.container = document.createElement('div');
        this.container.style.cssText = CONTAINER_STYLES;

        // Create loading spinner
        this.spinner = document.createElement('div');
        this.spinner.style.cssText = SPINNER_STYLES;

        // Create loading text
        this.loadingText = document.createElement('div');
        this.loadingText.textContent = 'Loading...';
        this.loadingText.style.cssText = LOADING_TEXT_STYLES;

        // Create iframe (initially hidden)
        this.iframe = document.createElement('iframe');
        this.iframe.style.cssText = IFRAME_STYLES;

        // Add spinner and text to container
        this.container.appendChild(this.spinner);
        this.container.appendChild(this.loadingText);

        // Configure iframe with proper sandboxing
        const iframeConfig: IframeConfig = {
            src: `${connectionUrl}&sessionId=${sessionId}`,
            id: `dataone-iframe-${sessionId}`,
            'data-session-id': sessionId,
            title: 'D·One Connection Journey',
            sandbox: this.getSandboxPermissions(),
            allow: this.getAllowPermissions(),
            loading: 'lazy',
            onLoad: () => {
                this.showIframe();
            },
            onError: () => {
                throw new Error('D·One Iframe failed to load');
            },
        };

        this.configureIframe(iframeConfig);

        this.container.appendChild(this.iframe);

        // Add elements to overlay
        this.overlay.appendChild(this.container);
        // this.overlay.appendChild(this.iframe);

        // Add overlay to document
        document.body.appendChild(this.overlay);
    }

    /**
     * Show the overlay with animation
     */
    show(): void {
        if (!this.overlay || !this.iframe) {
            throw new Error('Overlay not created. Call create() first.');
        }

        this.isVisible = true;
        this.overlay.style.cssText += OVERLAY_VISIBLE_STYLES;

        // Re-enable pointer events when shown
        this.overlay.style.pointerEvents = 'auto';

        // disable body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Show the iframe and hide the spinner
     */
    private showIframe(): void {
        if (!this.iframe || !this.spinner || !this.loadingText) {
            return;
        }

        // Show iframe
        this.iframe.style.cssText += IFRAME_VISIBLE_STYLES;
        this.spinner.style.cssText += SPINNER_VISIBLE_STYLES;
        this.loadingText.style.cssText += SPINNER_VISIBLE_STYLES;

        // Remove spinner and loading text after animation
        setTimeout(() => {
            if (this.spinner && this.loadingText) {
                this.spinner.remove();
                this.loadingText.remove();
            }
        }, 300);
    }

    /**
     * Hide the overlay with animation
     */
    hide(): void {
        if (!this.overlay || !this.iframe || !this.spinner || !this.loadingText) {
            return;
        }

        this.isVisible = false;
        this.overlay.style.cssText += OVERLAY_HIDDEN_STYLES;
        this.iframe.style.cssText = this.iframe.style.cssText.replace(IFRAME_VISIBLE_STYLES, '');

        this.spinner.style.cssText = this.spinner.style.cssText.replace(SPINNER_VISIBLE_STYLES, '');
        this.loadingText.style.cssText = this.loadingText.style.cssText.replace(SPINNER_VISIBLE_STYLES, '');

        // Disable pointer events when hidden to prevent interference
        this.overlay.style.pointerEvents = 'none';

        // enable body scroll
        document.body.style.overflow = this.bodyScrollStyle;
    }

    /**
     * Destroy the overlay and iframe
     */
    destroy(): void {
        // Restore body scroll before removing overlay
        document.body.style.overflow = this.bodyScrollStyle;

        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }

        // Remove animation styles
        if (this.animationStyle && this.animationStyle.parentNode) {
            this.animationStyle.parentNode.removeChild(this.animationStyle);
        }

        this.overlay = null;
        this.iframe = null;
        this.animationStyle = null;
        this.isVisible = false;
    }

    /**
     * Inject spinner animation CSS into the document
     */
    private injectSpinnerAnimation(): void {
        // Check if animation styles already exist
        if (document.querySelector('style[data-dataone-spinner]')) {
            return;
        }

        this.animationStyle = document.createElement('style');
        this.animationStyle.setAttribute('data-dataone-spinner', 'true');
        this.animationStyle.textContent = SPINNER_ANIMATION;
        document.head.appendChild(this.animationStyle);
    }

    /**
     * Get the iframe element
     */
    getIframe(): HTMLIFrameElement | null {
        return this.iframe;
    }

    /**
     * Check if overlay is visible
     */
    isOverlayVisible(): boolean {
        return this.isVisible;
    }

    /**
     * Get sandbox permissions for the iframe
     */
    private getSandboxPermissions(): SandboxPermission[] {
        return [
            'allow-same-origin',
            'allow-scripts',
            'allow-forms',
            'allow-popups',
            'allow-popups-to-escape-sandbox',
            'allow-top-navigation-by-user-activation',
            'allow-modals',
            'allow-storage-access-by-user-activation',
        ];
    }

    /**
     * Get allow permissions for the iframe
     */
    private getAllowPermissions(): string {
        return [...DATA_ONE_VALID_ORIGINS].join(' ');
    }

    /**
     * Configure iframe with the provided configuration
     */
    private configureIframe(config: IframeConfig): void {
        if (!this.iframe) {
            throw new Error('Iframe not created');
        }

        this.iframe.id = config.id;
        this.iframe.src = config.src;
        this.iframe.title = config.title;
        this.iframe.setAttribute('data-session-id', config['data-session-id']);
        this.iframe.sandbox.value = config.sandbox.join(' ');
        this.iframe.allow = config.allow;
        this.iframe.loading = config.loading;
        this.iframe.onload = config.onLoad ?? null;
        this.iframe.onerror = config.onError ?? null;
    }
}
