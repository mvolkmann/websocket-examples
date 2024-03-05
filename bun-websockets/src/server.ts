import {Hono} from 'hono';
import type {Context} from 'hono';
import {serveStatic} from 'hono/bun';

const app = new Hono();
app.use('/*', serveStatic({root: './public'}));

app.get('/greet', (c: Context) => {
  return c.text('Hello Bun!');
});

const wsServer = Bun.serve({
  // The WebSocket port defaults to 3000 which conflicts with the HTTP server.
  port: 3001,
  fetch(req, server) {
    // Upgrade the request to support WebSockets.
    if (server.upgrade(req)) return; // no Response
    return new Response('WebSockets upgrade failed', {status: 500});
  },
  websocket: {
    open(ws) {
      console.log('WebSocket is open.');
    },
    // TODO: Why is this never called?
    drain(ws) {
      console.log('WebSocket is ready to receive more data.');
    },
    message(ws, message) {
      console.log(`received "${message}"`);
      if (message === 'stop') {
        ws.close();
      } else {
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

console.log('WebSocket server is listening on port', wsServer.port);

export default app;
