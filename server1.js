


import fs from 'fs';
import express from 'express';

import https from 'https';
import url from 'url';

// import WebSocket from 'ws';
import { WebSocketServer, WebSocket } from 'ws';


const app = express();


  let server = "";
    const options = {
    //   key: fs.readFileSync('csr.pem'),
    //   cert: fs.readFileSync('privatekey.pem')
      key: fs.readFileSync('/var/www/html/Superadmin/my-nodejs-project/privatekey.pem'),
      cert: fs.readFileSync('/var/www/html/Superadmin/my-nodejs-project/csr.pem'), 
    };


    server = https.createServer(options,app);


  const wss = new WebSocketServer({ server })


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

            wss.clients.forEach(client => {

              if (client !== ws && client.readyState === WebSocket.OPEN && client.sessionId === sessionId) {
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

server.listen(443, () => {
    console.log('Server running on https://3.124.177.12 or http://chatnow.co.in');
});






