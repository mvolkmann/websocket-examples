import express from 'express';
import WebSocket from 'ws';

const app = express();
app.use(express.static('public'));

app.get('/greet', (req, res) => {
  res.send('Hello World!');
});

// Create a WebSocket server.
const wsServer = new WebSocket.Server({port: 3001});

// When a client connects ...
wsServer.on('connection', ws => {
  ws.onopen = () => {
    console.log('WebSocket is open.');
  };

  // Listen for messages from the client.
  ws.onmessage = event => {
    const message = event.data;
    // console.log('server.js onmessage: event =', event);
    console.log(`received "${message}"`);
    if (message === 'stop') {
      ws.close();
    } else {
      ws.send('Hello from server!');
    }

    /*
    // Broadcast the message to all the clients.
    // wsServer.clients is not an Array, so you cannot use a for-of loop.
    wsServer.clients.forEach(client => {
      const isOpen = client.readyState === WebSocket.OPEN;

      // To send to all open clients,
      // including the one that sent the message ...
      if (isOpen) client.send(message);

      // To send to all open clients
      // except the one that sent the message ...
      //const isSelf = client === ws;
      //if (isOpen && !isSelf) client.send(message);
    });
    */
  };

  ws.onerror = error => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket is closed.');
  };
});

app.listen(3000, function () {
  console.log('listening on port', this.address().port);
});
