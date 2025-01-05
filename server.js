// import translate from 'translate-google-api';

import fs from 'fs';
import express from 'express';
import http from 'http';
import https from 'https';
import url from 'url';
// import WebSocket from 'ws';
import { WebSocketServer, WebSocket } from 'ws';
// require('dotenv').config();

// const fs = require('fs');
// const express = require('express');
// const http = require('http');
// const https = require('https');
// const WebSocket = require('ws');
// // const translate = require('google-translate-api');
// const translate = require('translate');

const app = express();

// app.get('/',(req, res) => {
//   res.json({check:`working`});
// })



  let server = "";
  if (process.env.NODE_ENV === 'Production'){
    const options = {
      key: fs.readFileSync('/etc/letsencrypt/live/chatnow.co.in-0001/privkey.pem'),
      cert: fs.readFileSync('/etc/letsencrypt/live/chatnow.co.in-0001/fullchain.pem')
    };
    // const server = createServer({
    //   cert: readFileSync('/etc/letsencrypt/live/chatnow.co.in-0001/fullchain.pem'),
    //   key: readFileSync('/etc/letsencrypt/live/chatnow.co.in-0001/privkey.pem')
    // }, app);

    server = https.createServer(options,app);
    
  }else{
    
    server = http.createServer(app);
  }


  
  // const wss = new WebSocket.Server({ server });
  const wss = new WebSocketServer({ server })
  // const url = require('url');
  const port = 5000;


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
      console.log(`Received message: ${message}`);
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
              // console.log(client.readyState)
              // console.log(WebSocketServer)
              // console.log(WebSocketServer.OPEN)
              // console.log(client.sessionId)
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


  wss.on('error', (error) => {
  console.error('Server error:', error);
  });


server.listen(443, () => {
    console.log('Server running on https://3.124.177.12 or http://chatnow.co.in');
});













// server.listen(process.env.PORT || port, () => {
//   console.log('listening on *:5000 ');
// });


// HTTPS server
// https.createServer(options, app).listen(443, () => {
      // server.listen(443, () => {
      //   console.log('Server running on https://<your-ip-address>');
      // });



// Optional: Redirect HTTP to HTTPS
// const http = require('http');
// http.createServer((req, res) => {
//   res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
//   res.end();
// }).listen(80);

// exports.app = functions.https.onRequest(server);
