<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'vendor/autoload.php';


use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;



class MyWebSocket implements MessageComponentInterface {
    public function onOpen(ConnectionInterface $conn) {
        echo "New connection established ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        echo "Message received: $msg\n";
        $from->send("You said: $msg");
    }

    public function onClose(ConnectionInterface $conn) {
        echo "Connection {$conn->resourceId} closed\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
        $conn->close();
    }
}

$loop = Factory::create();

// Create the base React socket
$webSocket = new Server('0.0.0.0', $loop);

// Wrap the React socket in a SecureServer for SSL
$secureWebSocket = new SecureServer($webSocket, $loop, [
    'local_cert'  => '/etc/letsencrypt/live/chatnow.co.in-0001/fullchain.pem', 
    'local_pk'    => '/etc/letsencrypt/live/chatnow.co.in-0001/privkey.pem', 
    // key: fs.readFileSync('/etc/letsencrypt/live/chatnow.co.in-0001/privkey.pem'),
    // cert: fs.readFileSync('/etc/letsencrypt/live/chatnow.co.in-0001/fullchain.pem')
    'allow_self_signed' => true,
    'verify_peer' => false
]);

$app = new IoServer(
    new HttpServer(
        new WsServer(
            new MyWebSocket()
        )
    ),
    $secureWebSocket,
    $loop
);

echo "WebSocket server running on wss://0.0.0.0:8000\n";
$loop->run();
