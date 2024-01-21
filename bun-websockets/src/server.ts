import {Hono} from 'hono';
import type {Context} from 'hono';
import {serveStatic} from 'hono/bun';

const app = new Hono();
app.use('/*', serveStatic({root: './public'}));

app.get('/greet', (c: Context) => {
  return c.text('Hello Bun!');
});

const wsServer = Bun.serve({
  port: 3001,
  fetch(req, server) {
    // Upgrade the request to support WebSockets.
    if (server.upgrade(req)) {
      return; // do not return a Response
    }
    return new Response('WebSockets upgrade failed', {status: 500});
  },
  websocket: {
    open(ws) {
      console.log('WebSocket is open.');
    },
    // TODO: Wby is this never called?
    drain(ws) {
      console.log('WebSocket is ready to receive more data.');
    },
    message(ws, message) {
      console.log(`received "${message}"`);
      ws.send('Hello from server!');
    },
    // TODO: Wby is this called?
    close(ws, code, message) {
      console.log('WebSocket closed with code', code, 'and message', message);
    }
  }
});

console.log('WebSocket server is listening on port', wsServer.port);

export default app;
