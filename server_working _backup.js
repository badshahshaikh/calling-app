import translate from 'translate-google-api';

import dotenv from 'dotenv';
import fs from 'fs';
import express from 'express';
import http from 'http';
import https from 'https';
import url from 'url';
import QRCode from 'qrcode';
import crypto from 'crypto';
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

dotenv.config();
const app = express();

// app.get('/',(req, res) => {
//   res.json({check:`working`});
// })

app.get('/getUser', (req, res) => {
  const qrData = req.query.data;
  console.log("Received QR code data: ", qrData);
  // chatnow.co.in/c95233fff58d00b3a6a76d55ba5412322f7d7571dbe85a098990a52c2740f7f6
  res.json({ message: `QR code data received: ${qrData}` });


})


    // for getting the clients IP address
    app.get('/getQR', (req, res) => {
      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      // console.log("Client IP address:", clientIp);
      // hash the Ip address
      const ipAddress = clientIp;
      const hash = crypto.createHash('sha256').update(ipAddress).digest('hex');
      console.log('Hashed IP address:', hash);
      // res.send(`Client IP address: ${clientIp}`);
      
      // generate embaded qr code 
      const data = "chatnow.co.in/"+hash;
      QRCode.toDataURL(data)
        .then((url) => {
          res.send({url:`${url}`,sessionlink:`${data}`});
          // console.log('QR code Data URL:', url);
        })
        .catch((err) => {
          console.error('Error generating QR code:', err);
        });

    });


console.log('checking',process.env.NODE_ENV);

if (process.env.NODE_ENV === 'development') {

    // const app = express();
    const server = http.createServer(app);
    const wss = new WebSocketServer({ server })
    const port = 5000;


    

    // translate 
    (async () => {
      const textToTranslate = 'what are you doing right now I am doing my work';
      const targetLanguage = 'hi'; 
      try {
        const result = await translate(textToTranslate, { to: targetLanguage });
        console.log(`Translated text: ${result}`);
      } catch (err) {
        console.error('Error during translation:', err);
      }
    })();









    server.listen(8080, 'localhost', () => {
      console.log(`Server running`);
    });

}else{


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

  if (process.env.NODE_ENV === 'Production'){

    server.listen(443, () => {
      console.log('Server running on https://3.124.177.12 or http://chatnow.co.in');
    });

  }else{

    server.listen(80, () => {
      console.log('listening on *:80 ');
    });


  }





}







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
