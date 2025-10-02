import { Journey } from './journey';
import {
    JourneyConfig,
    JourneyInstance,
    JourneyStatus,
    JourneyEventType,
    JourneyEvent,
    OnErrorCallback,
    OnExitCallback,
    SandboxPermission,
    IframeConfig,
} from './types';

// Export the main function
export function createJourney(config: JourneyConfig): JourneyInstance {
    const journey = new Journey(config);

    // Return only the public interface
    return {
        start: () => journey.start(),
        close: () => journey.close(),
        remove: () => journey.remove(),
        get status() {
            return journey.status;
        },
    };
}

// Export types for TypeScript users
export type {
    JourneyConfig,
    JourneyInstance,
    JourneyStatus,
    JourneyEventType,
    JourneyEvent,
    OnErrorCallback,
    OnExitCallback,
    SandboxPermission,
    IframeConfig,
};

// Export classes for advanced use cases
export { Journey } from './journey';
export { IframeOverlay } from './iframe-overlay';
export { MessageHandler } from './message-handler';
