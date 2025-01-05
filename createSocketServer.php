<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'vendor/autoload.php';



// Sample code for WebSocket integration using Ratchet
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
class WebSocketServer implements MessageComponentInterface {
    public function onOpen(ConnectionInterface $conn) {
        // Handle WebSocket connection opening
        echo "open";
    }
    public function onMessage(ConnectionInterface $from, $msg) {
        // Handle incoming WebSocket messages
        echo " $msg ";
    }
    public function onClose(ConnectionInterface $conn) {
        // Handle WebSocket connection closing
        echo "Close";
    }
    public function onError(ConnectionInterface $conn, \Exception $e) {
        // Handle WebSocket errors
        echo "error";
    }
}
// Create a WebSocket server
$server = new \Ratchet\WebSocket\WsServer(new WebSocketServer());
// Run the server
$app = new \Ratchet\Http\HttpServer($server);
\Ratchet\Server\IoServer::factory($app, 8080)->run();



// use Ratchet\MessageComponentInterface;
// use Ratchet\ConnectionInterface;



// class MyWebSocket implements MessageComponentInterface {
//     public function onOpen(ConnectionInterface $conn) {
//         echo "New connection established ({$conn->resourceId})\n";
//     }

//     public function onMessage(ConnectionInterface $from, $msg) {
//         echo "Message received: $msg\n";
//         $from->send("You said: $msg");
//     }

//     public function onClose(ConnectionInterface $conn) {
//         echo "Connection {$conn->resourceId} closed\n";
//     }

//     public function onError(ConnectionInterface $conn, \Exception $e) {
//         echo "Error: " . $e->getMessage() . "\n";
//         $conn->close();
//     }
// }

// $loop = Factory::create();

// // Create the base React socket
// $webSocket = new Server('0.0.0.0:8000', $loop);

// // Wrap the React socket in a SecureServer for SSL
// $secureWebSocket = new SecureServer($webSocket, $loop, [
//     'local_cert'  => '/etc/letsencrypt/live/chatnow.co.in-0001/fullchain.pem', 
//     'local_pk'    => '/etc/letsencrypt/live/chatnow.co.in-0001/privkey.pem', 
//     // key: fs.readFileSync('/etc/letsencrypt/live/chatnow.co.in-0001/privkey.pem'),
//     // cert: fs.readFileSync('/etc/letsencrypt/live/chatnow.co.in-0001/fullchain.pem')
//     'allow_self_signed' => true,
//     'verify_peer' => false
// ]);

// $app = new IoServer(
//     new HttpServer(
//         new WsServer(
//             new MyWebSocket()
//         )
//     ),
//     $secureWebSocket,
//     $loop
// );

// echo "WebSocket server running on wss://0.0.0.0:8000\n";
// $loop->run();


