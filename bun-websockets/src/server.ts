import {Hono} from 'hono';
import {serveStatic} from 'hono/bun';

const app = new Hono();

// Serve index.html and styles.css from the public directory.
// The default port is 3000.
app.use('/*', serveStatic({root: './public'}));

const wsServer = Bun.serve({
  // The WebSocket port defaults to 3000 which conflicts with the HTTP server.
  port: 3001,
  fetch(req, server) {
    // Upgrade the request to support WebSockets.
    if (server.upgrade(req)) return; // no Response needed for success
    return new Response('WebSockets upgrade failed', {status: 500});
  },
  websocket: {
    open(ws) {
      console.log('WebSocket is open.');
    },
    // TODO: Why is this never called?
    message(ws, message) {
      console.log(`received "${message}"`);
      if (message === 'stop') {
        ws.close();
      } else {
        // A real app would send more useful messages.
        ws.send(`Thank you for sending "${message}".`);
      }
    },
    // See WebSocket protocol status codes at
    // https://datatracker.ietf.org/doc/html/rfc6455#section-7.4
    // 1000 is normal closure.
    // 1005 is used when the client closes the WebSocket.
    close(ws, code, message) {
      console.log('WebSocket closed with code', code);
      if (message) console.log(`WebSocket closed with message "${message}"`);
    }
  }
});

console.log('listening on port', wsServer.port);

export default app;
