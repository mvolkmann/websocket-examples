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
    message(ws, message: string) {
      try {
        const data = JSON.parse(message);
        // "start" is a form input name.
        countdown(ws, Number(data.start));
      } catch (e) {
        // This handles invalid JSON.
        console.error(e);
      }
    }
  }
});

// This sends WebSocket messages that are numbers
// starting at a specified number and counting down to zero.
async function countdown(ws: WebSocket, start: number) {
  let n = start;
  while (n >= 0) {
    // Using innerHTML for the first message replaces all the previous content.
    const swap = n === start ? 'innerHTML' : 'beforeend';
    const html = (
      <div id="countdown" hx-swap-oob={swap}>
        <div>{n}</div>
      </div>
    );
    ws.send(html.toString());
    await Bun.sleep(1000); // wait one second between each message
    n--;
  }
}

console.log('WebSocket server is listening on port', wsServer.port);

export default app;
