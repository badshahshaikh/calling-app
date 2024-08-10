const express = require('express');
const webPush = require('web-push');
const http = require('http');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient } = require('mongodb');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


const port = 3000;

// Generate VAPID keys
// const vapidKeys = webPush.generateVAPIDKeys();

// Store VAPID keys in a variable
const keys = {
    publicKey: 'BEC38Af29mqsfaLoDJCw5YN0Ywg7HJsR_2pyvmaL_u6zFO4vhEn_L8pH4qAjIv3GlrhxSfD2o53m_wku9BhI8Qo',
    privateKey: '7AQ3JWIwO_D6p7xs4QlkMEC2uttEnXMU9fJQfbUu12k'
};

let clients = new Map();
wss.on('connection', (ws,req) => {
    const userID = req.url.split('?userID=')[1];
    if (!userID) {
        ws.close(1008, 'User ID is required');
        return;
      }

    if (clients.has(userID)) {
        clients.get(userID).push(ws);
    } else {
        clients.set(userID, [ws]);
    }
    
    // const userID = req.headers['sec-websocket-key'];s
    // clients.set(userID, ws);
    console.log('New client connected: ',userID);
  
    ws.on('message', (message) => {
      console.log(`Received message from ${userID}: => ${message}`);
      clients.get(userID).forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
      
      // ws.send('Hello, you sent -> ' + message);

        // const data = JSON.parse(message);
        // // Relay signaling messages to the intended recipient
        // if (data.to && clients.has(data.to)) {
        //     const recipient = clients.get(data.to);
        //     recipient.send(JSON.stringify({ from: id, ...data }));
        // }

    });
  
    ws.on('close', () => {
    //   clients.delete(userID);

        const userConnections = clients.get(userID).filter(client => client !== ws);
        if (userConnections.length > 0) {
            clients.set(userID, userConnections);
        } else {
            clients.delete(userID);
        }
        
        console.log('Client disconnected: ',userID);
    });
  });
  

// "BEC38Af29mqsfaLoDJCw5YN0Ywg7HJsR_2pyvmaL_u6zFO4vhEn_L8pH4qAjIv3GlrhxSfD2o53m_wku9BhI8Qo"
// "7AQ3JWIwO_D6p7xs4QlkMEC2uttEnXMU9fJQfbUu12k"

// "BEC38Af29mqsfaLoDJCw5YN0Ywg7HJsR_2pyvmaL_u6zFO4vhEn_L8pH4qAjIv3GlrhxSfD2o53m_wku9BhI8Qo"
// "7AQ3JWIwO_D6p7xs4QlkMEC2uttEnXMU9fJQfbUu12k"

webPush.setVapidDetails('mailto:test@test.com', keys.publicKey, keys.privateKey);



// Serve static files from the "public" directory
app.use(express.static('public'));

app.use(bodyParser.json());

app.post('/subscribe',(req,res) =>{
    const subscription = req.body;

    res.status(201).json({});

    const payload = JSON.stringify({'title':'Push Test'});

    webPush.sendNotification(subscription,payload).catch(err=>console.error(err));
    
});


app.post('/regPush',(req,res) => {

    const subscription = req.body;
    console.log(subscription);
    let checkInsert = insertSubscription(subscription);
    // if ( checkInsert ){
    console.log(checkInsert)
    res.json(checkInsert);
    // }

});

// Endpoint to serve VAPID keys
app.get('/vapid-keys', (req, res) => {
    res.json(keys);
});

app.post('/send-notification', (req, res) => {
    // console.log(req);
    const data = req.body;
    console.log('Received data:', data);

    const subscription = req.body.subscription;
    const payload = JSON.stringify({
        title: 'Test Notification',
        body: 'This is a test notification'
    });

    webPush.sendNotification(subscription, payload)
        .then(response => {
            res.status(200).json({ message: 'Notification sent successfully' });
        })
        .catch(error => {
            res.status(500).json({ error: 'Error sending notification', details: error });
        });
});


app.post('/sendPushToReg',async (req,res) => {

    try {
        await client.connect();
        console.log('Connected successfully to server');
        const db = client.db(dbName);
        const collection = db.collection('subscriber'); 
        const cursor = collection.find({});
        const getSubscriber = await cursor.toArray();
        const payload = JSON.stringify({
            title: 'Test Notification',
            body: 'This is a test notification'
        });
        getSubscriber.forEach(item => {
            console.log(item.endpoint);
            console.log(item.expirationTime);
            console.log(item.keys.p256dh);
            console.log(item.keys.auth);
            webPush.sendNotification(item, payload)
        });
        res.json(getSubscriber);
        // return 'true';
    }catch (error) {
        console.error('Error inserting document:', error);
    } finally {
        await client.close();
    }

    // let getsubs = getSubscription(data => {
    //     console.log(data);
    // });
    
    // webPush.sendNotification(subscription, payload)
    // .then(response => {
    //     res.status(200).json({ message: 'Notification sent successfully' });
    // })
    // .catch(error => {
    //     res.status(500).json({ error: 'Error sending notification', details: error });
    // });

})


const url = 'mongodb://127.0.0.1:27017/'; 
const dbName = 'Testing';
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });


async function insertSubscription(subscription) {
    try {
        await client.connect();
        console.log('Connected successfully to server');
        const db = client.db(dbName);
        const collection = db.collection('subscriber'); // Replace with your collection name
        const insertResult = await collection.insertOne(subscription);
        console.log('Inserted document:', insertResult.insertedId);
        return insertResult.insertedId;
    }catch (error) {
        console.error('Error inserting document:', error);
    } finally {
        await client.close();
    }
}


async function getSubscription(){

    try {
        await client.connect();
        console.log('Connected successfully to server');
        const db = client.db(dbName);
        const collection = db.collection('subscriber'); 
        const cursor = collection.find({});
        const getSubscriber = await cursor.toArray();
        // console.log('document:', getSubscriber);
        return 'true';
    }catch (error) {
        console.error('Error inserting document:', error);
    } finally {
        await client.close();
    }

}



server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});