# @dataone/iframe-connection-journey

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
npm install @dataone/iframe-connection-journey

# Using yarn
yarn add @dataone/iframe-connection-journey
```

### CDN

```html
<script src="https://unpkg.com/@dataone/iframe-connection-journey/dist/iife/index.js"></script>
```

## Quick Start

### Basic Usage

```javascript
import { createJourney } from "@dataone/iframe-connection-journey";

// Create a journey instance
const journey = createJourney({
  connectionUrl: "https://connect.data.one/[partner]?token=connection-token",
  sessionId: "unique-session-id-123",
  onComplete: (data) => {
    console.log("Connection completed successfully!", data);
    // Handle successful connection
  },
  onError: (error) => {
    console.error("Connection failed:", error);
    // Handle connection error
  },
  onExit: () => {
    console.log("User exited the journey");
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

    <script src="https://unpkg.com/@dataone/iframe-connection-journey/dist/iife/index.js"></script>
    <script>
      document
        .getElementById("connect-btn")
        .addEventListener("click", function () {
          const journey = window.__dataone.createJourney({
            connectionUrl:
              "https://connect.data.one/[partner]?token=connection-token",
            sessionId: "unique-session-id-123",
            onComplete: function (data) {
              alert("Connection completed successfully!");
              console.log("Connection data:", data);
            },
            onError: function (error) {
              alert("Connection failed: " + error.message);
            },
            onExit: function () {
              console.log("User exited the journey");
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

| Property        | Type                 | Required | Description                                           |
| --------------- | -------------------- | -------- | ----------------------------------------------------- |
| `connectionUrl` | `string`             | ✅       | The D·One connection URL with token parameter         |
| `sessionId`     | `string`             | ✅       | Unique identifier for this connection session         |
| `onComplete`    | `OnCompleteCallback` | ❌       | Callback fired when connection completes successfully |
| `onError`       | `OnErrorCallback`    | ❌       | Callback fired when an error occurs                   |
| `onExit`        | `OnExitCallback`     | ❌       | Callback fired when user exits the journey            |

#### JourneyInstance

| Method     | Description                                   |
| ---------- | --------------------------------------------- |
| `start()`  | Starts the connection journey                 |
| `close()`  | Closes the journey overlay                    |
| `remove()` | Removes the journey and cleans up resources   |
| `status`   | Current status: `'initialising'` or `'ready'` |

### Event Callbacks

#### `OnCompleteCallback`

```typescript
(data?: any) => void
```

Called when the user successfully completes the connection journey. The `data` parameter contains any relevant connection information returned by D·One.

#### `OnErrorCallback`

```typescript
(error: Error | string) => void
```

Called when an error occurs during the journey. The error can be an Error object or a string message.

#### `OnExitCallback`

```typescript
() => void
```

Called when the user exits the journey without connecting any accounts (e.g., clicking close or pressing escape).

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
- Be used to track the specific connection session

## Security

This package implements several security measures:

- **Origin Validation**: Only accepts messages from valid D·One origins
- **Iframe Sandboxing**: Uses secure iframe sandbox attributes
- **Session Validation**: Validates session IDs in all communications
- **XSS Protection**: Sanitizes and validates all incoming data

## Error Handling

The package provides comprehensive error handling:

```javascript
const journey = createJourney({
  connectionUrl: "https://connect.data.one/connect?token=invalid-token",
  sessionId: "test-session",
  onError: (error) => {
    if (error.message.includes("token")) {
      // Handle token-related errors
      console.error("Invalid or expired token");
    } else if (error.message.includes("network")) {
      // Handle network errors
      console.error("Network connection failed");
    } else {
      // Handle other errors
      console.error("Unexpected error:", error);
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

- Check browser console for CORS errors
- Ensure the iframe is properly loaded before starting
- Verify the session ID matches between parent and iframe

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
