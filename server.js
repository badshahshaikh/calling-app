
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const url = require('url');

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

  // console.log('a user connected');

  ws.on('message', (message) => {
    // const parsedMessage = JSON.parse(message);
    // switch (parsedMessage.type) {
    //   case 'offer':
    //   case 'answer':
    //   case 'candidate':
    //     wss.clients.forEach(client => {
    //       if (client !== ws && client.readyState === WebSocket.OPEN) {
    //         client.send(message);
    //       }
    //     });
    //     break;
    // }

    // const parsedMessage = JSON.parse(message);
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN && client.sessionId === sessionId) {
        client.send(message);
      }
    });

    // clients.get(userID).forEach(client => {
    //   if (client !== ws && client.readyState === WebSocket.OPEN) {
    //     client.send(message);
    //   }
    // });
    
  });


  ws.on('close', (code, reason) => {
      console.log('Connection closed:', code, reason);
  });
  
});

server.listen(5000, () => {
  console.log('listening on *:5000 ');
});

// exports.app = functions.https.onRequest(server);
