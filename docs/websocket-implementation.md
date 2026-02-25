# WebSocket Infrastructure Server

This is a reference implementation for the WebSocket server that would handle real-time infrastructure monitoring.

## Message Types

### Client to Server

```typescript
// Service action request
{
  type: "service_action",
  data: {
    serviceId: string,
    action: "start" | "stop" | "restart"
  },
  timestamp: string
}

// Subscribe to updates
{
  type: "subscribe",
  data: {
    types: ["services", "metrics", "logs"]
  },
  timestamp: string
}
```

### Server to Client

```typescript
// Initial services data
{
  type: "services",
  data: ServiceStatus[],
  timestamp: string
}

// System metrics update
{
  type: "metrics",
  data: SystemMetrics,
  timestamp: string
}

// Individual service update
{
  type: "service_update",
  data: ServiceStatus,
  timestamp: string
}

// Error message
{
  type: "error",
  data: {
    message: string,
    code?: string
  },
  timestamp: string
}
```

## Implementation Example (Node.js/Bun)

```typescript
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws) => {
  console.log("Client connected");

  // Send initial data
  ws.send(
    JSON.stringify({
      type: "services",
      data: await getServices(),
      timestamp: new Date().toISOString(),
    }),
  );

  ws.send(
    JSON.stringify({
      type: "metrics",
      data: await getMetrics(),
      timestamp: new Date().toISOString(),
    }),
  );

  // Handle incoming messages
  ws.on("message", async (data) => {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case "service_action":
          await handleServiceAction(message.data);
          break;
        case "subscribe":
          // Handle subscription logic
          break;
      }
    } catch (error) {
      ws.send(
        JSON.stringify({
          type: "error",
          data: { message: error.message },
          timestamp: new Date().toISOString(),
        }),
      );
    }
  });

  // Set up periodic updates
  const interval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      // Send updated metrics every 30 seconds
      ws.send(
        JSON.stringify({
          type: "metrics",
          data: getMetrics(),
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }, 30000);

  ws.on("close", () => {
    clearInterval(interval);
    console.log("Client disconnected");
  });
});
```

## Benefits of WebSocket vs Polling

### ✅ **Real-time Updates**

- Instant notifications when services change state
- No need for manual refresh buttons
- Live metrics updates

### ✅ **Reduced Server Load**

- No constant polling requests
- Server pushes data only when changed
- Lower bandwidth usage

### ✅ **Better User Experience**

- Always up-to-date information
- Immediate feedback on actions
- Connection status awareness

### ✅ **Scalability**

- Persistent connections are more efficient
- Can handle many concurrent clients
- Event-driven architecture

## Fallback Strategy

The implementation includes fallback to HTTP API when WebSocket is unavailable:

1. **Graceful Degradation**: Falls back to HTTP requests if WebSocket fails
2. **Retry Logic**: Automatic reconnection with exponential backoff
3. **Connection Status**: Clear indication of connection state to user
4. **Manual Controls**: Allow users to reconnect or disconnect manually

## Security Considerations

- Implement authentication/authorization for WebSocket connections
- Validate all incoming messages
- Rate limiting for service actions
- Proper error handling and logging
