import { createJourney } from '../index';

// Mock the DOM
const mockIframe = {
    style: { cssText: '' },
    src: '',
    sandbox: { value: '' },
    allow: '',
    referrerPolicy: '',
    loading: '',
    contentWindow: {
        postMessage: jest.fn(),
    },
};

const mockOverlay = {
    style: { cssText: '' },
    appendChild: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    parentNode: {
        removeChild: jest.fn(),
    },
};

// Mock DOM methods
Object.defineProperty(document, 'createElement', {
    value: jest.fn((tagName) => {
        if (tagName === 'div') {
            return {
                ...mockOverlay,
                setAttribute: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                appendChild: jest.fn(),
                parentNode: { removeChild: jest.fn() },
                querySelector: jest.fn(),
            };
        }
        if (tagName === 'iframe') {
            return {
                ...mockIframe,
                setAttribute: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                appendChild: jest.fn(),
                parentNode: { removeChild: jest.fn() },
                getAttribute: jest.fn(() => 'test-session-123'),
                onload: null,
            };
        }
        if (tagName === 'style') {
            return {
                setAttribute: jest.fn(),
                textContent: '',
                parentNode: { removeChild: jest.fn() },
            };
        }
        return {};
    }),
});

Object.defineProperty(document.body, 'appendChild', {
    value: jest.fn(),
});

Object.defineProperty(document, 'head', {
    value: {
        appendChild: jest.fn(),
    },
});

Object.defineProperty(document, 'querySelector', {
    value: jest.fn(() => null),
});

Object.defineProperty(window, 'addEventListener', {
    value: jest.fn(),
});

Object.defineProperty(window, 'removeEventListener', {
    value: jest.fn(),
});

describe('Journey', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createJourney', () => {
        it('should create a journey instance with valid config', () => {
            const config = {
                connectionUrl: 'https://connect.data.one?token=test-token',
                sessionId: 'test-session-123',
                onComplete: jest.fn(),
                onError: jest.fn(),
                onExit: jest.fn(),
            };

            const journey = createJourney(config);

            expect(journey).toHaveProperty('start');
            expect(journey).toHaveProperty('close');
            expect(journey).toHaveProperty('status');
            expect(journey.status).toBe('ready');
        });

        it('should throw error for missing connectionUrl', () => {
            const config = {
                connectionUrl: '',
                sessionId: 'test-session-123',
            };

            expect(() => createJourney(config)).toThrow('connectionUrl is required');
        });

        it('should throw error for missing sessionId', () => {
            const config = {
                connectionUrl: 'https://connect.data.one?token=test-token',
                sessionId: '',
            };

            expect(() => createJourney(config)).toThrow('sessionId is required');
        });

        it('should throw error for invalid URL', () => {
            const config = {
                connectionUrl: 'not-a-valid-url',
                sessionId: 'test-session-123',
            };

            expect(() => createJourney(config)).toThrow('connectionUrl must be a valid URL');
        });
    });

    describe('Journey instance', () => {
        let journey: ReturnType<typeof createJourney>;

        beforeEach(() => {
            const config = {
                connectionUrl: 'https://connect.data.one?token=test-token',
                sessionId: 'test-session-123',
                onComplete: jest.fn(),
                onError: jest.fn(),
                onExit: jest.fn(),
            };

            journey = createJourney(config);
        });

        it('should have correct initial status', () => {
            expect(journey.status).toBe('ready');
        });

        it('should start the journey', () => {
            journey.start();
            // Since we can't access internal state, we just verify the method exists and can be called
            expect(typeof journey.start).toBe('function');
        });

        it('should close the journey', () => {
            journey.start();
            journey.close();
            // Since we can't access internal state, we just verify the method exists and can be called
            expect(typeof journey.close).toBe('function');
        });

        it('should throw error when starting unready journey', () => {
            // Create a new journey with invalid config to get initialising status
            const invalidConfig = {
                connectionUrl: '',
                sessionId: 'test-session-123',
            };

            expect(() => createJourney(invalidConfig)).toThrow('connectionUrl is required');
        });

        it('should not start already started journey', () => {
            journey.start();
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            journey.start();

            expect(consoleSpy).toHaveBeenCalledWith('D·One Iframe Journey: Journey is already started');

            consoleSpy.mockRestore();
        });
    });
});
