import express from 'express';
import WebSocket from 'ws';

const app = express();
app.use(express.static('public'));

app.get('/greet', (req, res) => {
  res.send('Hello World!');
});

// Create a WebSocket server.
const wss = new WebSocket.Server({port: 1919});

// When a client connects ...
wss.on('connection', ws => {
  // Listen for messages from the client.
  ws.on('message', message => {
    // Broadcast the message to all the clients.
    // wss.clients is not an Array, so you cannot use a for-of loop.
    wss.clients.forEach(client => {
      const isOpen = client.readyState === WebSocket.OPEN;

      // To send to all open clients,
      // including the one that sent the message ...
      if (isOpen) client.send(message);

      // To send to all open clients
      // except the one that sent the message ...
      //const isSelf = client === ws;
      //if (isOpen && !isSelf) client.send(message);
    });
  });

  // Send an initial message to the newly connected client.
  ws.send('connected to WebSocket server');
});

app.listen(3000, function () {
  console.log('listening on port', this.address().port);
});
