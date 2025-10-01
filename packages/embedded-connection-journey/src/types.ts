/**
 * Journey status states
 */
export type JourneyStatus = 'initialising' | 'ready';

/**
 * Journey event types
 */
export type JourneyEventType = 'error' | 'exit';

/**
 * Journey event data structure
 */
export interface JourneyEvent<T extends JourneyEventType> {
    type: T;
    name?: string;
    message?: string;
    sessionId: string;
    data?: unknown;
    timestamp: number;
}

/**
 * Event callback function types
 */
export type OnErrorCallback = (error: JourneyEvent<'error'>) => void;
export type OnExitCallback = () => void;

/**
 * Configuration options for creating a journey
 */
export interface JourneyConfig {
    connectionUrl: string;
    sessionId: string;
    onError?: OnErrorCallback;
    onExit?: OnExitCallback;
}

/**
 * Journey instance interface
 */
export interface JourneyInstance {
    start: () => void;
    close: () => void;
    remove: () => void;
    status: JourneyStatus;
}

/**
 * Iframe sandbox permissions
 */
export type SandboxPermission =
    | 'allow-same-origin'
    | 'allow-scripts'
    | 'allow-forms'
    | 'allow-popups'
    | 'allow-popups-to-escape-sandbox'
    | 'allow-top-navigation'
    | 'allow-top-navigation-by-user-activation'
    | 'allow-modals'
    | 'allow-pointer-lock'
    | 'allow-presentation'
    | 'allow-storage-access-by-user-activation';

/**
 * Iframe configuration options
 */
export interface IframeConfig {
    src: string;
    id: string;
    title: string;
    'data-session-id': string;
    sandbox: SandboxPermission[];
    allow: string;
    loading: 'eager' | 'lazy';
    onLoad?: () => void;
    onError?: () => void;
}
