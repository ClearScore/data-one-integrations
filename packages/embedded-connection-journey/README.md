# @dataone/embedded-connection-journey

A lightweight JavaScript library that enables you to seamlessly integrate the D·One connection journey into your website using an iframe overlay. This package provides a secure, user-friendly way to launch the D·One open banking connection flow without redirecting users away from your site.

## Features

- 🚀 **Easy Integration**: Simple API with minimal setup required
- 🔒 **Secure**: Validates origins and uses secure iframe sandboxing
- 📱 **Responsive**: Works across desktop and mobile devices
- 🔄 **Event-Driven**: Comprehensive event handling for journey lifecycle
- 📦 **Lightweight**: Small bundle size with no external dependencies
- 🛡️ **TypeScript**: Full TypeScript support with comprehensive type definitions

## Installation

### NPM/Yarn

```bash
# Using npm
npm install @dataone/embedded-connection-journey

# Using yarn
yarn add @dataone/embedded-connection-journey
```

### CDN

```html
<script src="https://unpkg.com/@dataone/embedded-connection-journey/dist/iife/index.js"></script>
```

## Quick Start

### Basic Usage

```javascript
import { createJourney } from '@dataone/embedded-connection-journey';

// Create a journey instance
const journey = createJourney({
  connectionUrl: 'https://connect.data.one/[partner]?token=connection-token',
  sessionId: 'unique-session-id-123',
  onError: (error) => {
    console.error('Connection failed:', error);
    // Handle connection error
  },
  onExit: () => {
    console.log('User exited the journey');
    // Handle user exit
  },
});

// Start the journey
<button onClick={() => journey.start()}>Connect Bank Account</button>;
```

### With CDN

```html
<!DOCTYPE html>
<html>
  <head>
    <title>D·One Integration</title>
  </head>
  <body>
    <button id="connect-btn">Connect Bank Account</button>

    <script src="https://unpkg.com/@dataone/embedded-connection-journey/dist/iife/index.js"></script>
    <script>
      document.getElementById('connect-btn').addEventListener('click', function () {
        const journey = window.__dataone.createJourney({
          connectionUrl: 'https://connect.data.one/[partner]?token=connection-token',
          sessionId: 'unique-session-id-123',
          onError: function (error) {
            alert('Connection failed: ' + error.message);
          },
          onExit: function () {
            console.log('User exited the journey');
          },
        });

        journey.start();
      });
    </script>
  </body>
</html>
```

## API Reference

### `createJourney(config: JourneyConfig): JourneyInstance`

Creates a new journey instance with the provided configuration.

#### JourneyConfig

| Property        | Type              | Required | Description                                                     |
| --------------- | ----------------- | -------- | --------------------------------------------------------------- |
| `connectionUrl` | `string`          | ✅       | The D·One connection URL with token parameter                   |
| `sessionId`     | `string`          | ✅       | Unique identifier for this connection session                   |
| `onError`       | `OnErrorCallback` | ❌       | Callback fired when an error occurs                             |
| `onExit`        | `OnExitCallback`  | ❌       | Callback fired when user exits the journey without a connection |

#### JourneyInstance

| Method     | Description                                   |
| ---------- | --------------------------------------------- |
| `start()`  | Starts the connection journey                 |
| `close()`  | Closes the journey overlay                    |
| `remove()` | Removes the journey and cleans up resources   |
| `status`   | Current status: `'initialising'` or `'ready'` |

### Event Callbacks

#### `OnErrorCallback`

```typescript
(error: Error | string) => void
```

Called when an error occurs during the journey that prevents the user from connecting an account. The error can be an Error object or a string message.

Recommendation:

- Request a new session and prompt the user to start the journey again.

#### `OnExitCallback`

```typescript
() => void
```

Called when the user exits the journey without connecting any accounts (e.g., clicking close or pressing escape).

Recommendation:

- Request a new session and prompt the user to start the journey again.

> Note: The `onExit` callback is only called when the user exits the journey without connecting any accounts. It is not called when the user clicks the close button with accounts connected. It is also not called when the user completes the journey successfully.

## Configuration

### Connection URL Requirements

The `connectionUrl` can be obtained by calling the D·One [Create Session API endpoint](https://docs.data.one/reference/createsession).

The `connectionUrl` must:

- Be a valid D·One connection URL that includes a `token` parameter.
- Use one of the supported origins:
  - `https://connect.data.one` (production)
  - `https://connect-sandbox.data.one` (sandbox)

### Session ID Requirements

The `sessionId` can be obtained by calling the D·One [Create Session API endpoint](https://docs.data.one/reference/createsession).

The `sessionId` must:

- Be a non-empty string
- Be unique for each connection attempt

## Security

This package implements several security measures:

- **Origin Validation**: Only accepts messages from valid D·One origins
- **Iframe Sandboxing**: Uses secure iframe sandbox attributes
- **Session Validation**: Validates session IDs in all communications
- **XSS Protection**: Sanitizes and validates all incoming data

## Error Handling

The package provides comprehensive error handling with the following properties:

| Property    | Type     | Description                                                                                   |
| ----------- | -------- | --------------------------------------------------------------------------------------------- |
| `type`      | `string` | The type of event (`error`)                                                                   |
| `name`      | `string` | The name of the error (`invalid-or-expired-token` or `start-error` or `initialisation-error`) |
| `message`   | `string` | The error message of the event (optional)                                                     |
| `sessionId` | `string` | The session ID                                                                                |
| `timestamp` | `number` | The timestamp of the event                                                                    |

```javascript
const journey = createJourney({
  connectionUrl: 'https://connect.data.one/connect?token=invalid-token',
  sessionId: 'test-session',
  onError: (error) => {
    switch (error.name) {
      case 'invalid-or-expired-token':
        console.error('Invalid or expired token');
        // Request a new session and prompt the user to start the journey again.
        break;
      case 'start-error':
        console.error('Failed to start the journey');
        // ensure the journey is ready and run `start()` again
        break;
      case 'initialisation-error':
        console.error('Failed to initialise the journey');
        // ensure the journey was initialised with the correct config
        break;
      default:
        console.error('Unexpected error:', error);
        // Handle other errors
        break;
    }
  },
});
```

## Troubleshooting

### Common Issues

**Journey doesn't start**

- Ensure the `connectionUrl` is valid and includes a token
- Check that the `sessionId` is a non-empty string
- Verify the connection URL uses a supported origin

**Messages not received**

- Check browser console for errors
- Ensure the iframe is properly loaded before starting
- Verify the correct session ID is passed to the journey config

**Styling conflicts**

- The overlay uses the highest possible z-index (2147483647) to appear above other content
- If you have conflicting styles, you may need to adjust your CSS

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For technical support or questions:

- Email: support@data.one
- Documentation: [https://docs.data.one](https://docs.data.one)

---

**Built with ❤️ by the D·One team**
