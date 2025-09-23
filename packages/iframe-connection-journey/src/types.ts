/**
 * Journey status states
 */
export type JourneyStatus = 'initialising' | 'ready';

/**
 * Journey event types
 */
export type JourneyEventType = 'complete' | 'error' | 'exit';

/**
 * Journey event data structure
 */
export interface JourneyEvent {
  type: JourneyEventType;
  sessionId: string;
  data?: any;
  timestamp: number;
}

/**
 * Event callback function types
 */
export type OnCompleteCallback = (data?: any) => void;
export type OnErrorCallback = (error: Error | string) => void;
export type OnExitCallback = () => void;

/**
 * Configuration options for creating a journey
 */
export interface JourneyConfig {
  connectionUrl: string;
  sessionId: string;
  onComplete?: OnCompleteCallback;
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
 * PostMessage data structure for communication with iframe
 */
export interface PostMessageData {
  type: JourneyEventType;
  sessionId: string;
  data?: any;
  timestamp: number;
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
