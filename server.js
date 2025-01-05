const fs = require('fs');
const express = require('express');
const https = require('https');
const url = require('url');
const { WebSocketServer, WebSocket } = require('ws');

const app = express();

let server = '';
const options = {
  key: fs.readFileSync('/var/www/html/Superadmin/my-nodejs-project/privatekey.pem'),
  cert: fs.readFileSync('/var/www/html/Superadmin/my-nodejs-project/csr.pem'), 
};

server = https.createServer(options, app);

const wss = new WebSocketServer({ server });

app.use(express.static('public'));

wss.on('connection', (ws, req) => {
  const parameters = url.parse(req.url, true);
  const sessionId = parameters.query.sessionId;

  if (!sessionId) {
    ws.close(1008, 'session ID is required');
    return;
  }

  ws.sessionId = sessionId;
  console.log(`User connected to session ${sessionId}`);

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);

    wss.clients.forEach((client) => {
      if (
        client !== ws &&
        client.readyState === WebSocket.OPEN &&
        client.sessionId === sessionId
      ) {
        client.send(message);
      }
    });
  });

  ws.on('close', (code, reason) => {
    console.log('Connection closed:', code, reason);
  });
});

wss.on('error', (error) => {
  console.error('Server error:', error);
});

server.listen(8000, () => {
  console.log(
    'Server running'
  );
});


//~ // Importing Express
//~ const express = require('express');

//~ // Create an Express app
//~ const app = express();

//~ // Define a route
//~ app.get('/', (req, res) => {
  //~ res.send('Hello, World!');
//~ });

//~ // Start the server
//~ const PORT = 3000;
//~ app.listen(PORT, () => {
  //~ console.log(`Server is running on http://localhost:${PORT}`);
//~ });
