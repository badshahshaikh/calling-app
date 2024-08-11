<?php

// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

require 'vendor/autoload.php';

use Minishlink\WebPush\VAPID;

// Generate VAPID keys
$private_key = openssl_pkey_new([
    'private_key_type' => OPENSSL_KEYTYPE_EC,
    'curve_name' => 'prime256v1',
]);

$details = openssl_pkey_get_details($private_key);
$private_key_raw = $details['ec']['d'];
$public_key_raw = $details['ec']['x'] . $details['ec']['y'];
$auth_token = base64_encode(openssl_random_pseudo_bytes(16));

$vapid = [
    'private_key' => rtrim(strtr(base64_encode($private_key_raw), '+/', '-_'), '='),
    'public_key' => rtrim(strtr(base64_encode($public_key_raw), '+/', '-_'), '='),
    'auth_token' => $auth_token,
];

echo json_encode($vapid);

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    
    <p> Here We Are </p>
    <script>
        // if ('serviceWorker' in navigator) {
        //     navigator.serviceWorker.register('/service-worker.js')
        //     .then(function(registration) {
        //         console.log('Service Worker registered with scope:', registration.scope);
        //     }).catch(function(error) {
        //         console.log('Service Worker registration failed:', error);
        //     });
        // }

        // navigator.serviceWorker.ready.then(function(registration) {
        //     return registration.pushManager.subscribe({
        //         userVisibleOnly: true,
        //         applicationServerKey: urlBase64ToUint8Array('YOUR_PUBLIC_VAPID_KEY')
        //     });
        // }).then(function(subscription) {
        //     console.log('User is subscribed:', subscription);
        //     // Send subscription to your server
        // }).catch(function(error) {
        //     console.error('Failed to subscribe the user:', error);
        // });

        // function urlBase64ToUint8Array(base64String) {
        //     const padding = '='.repeat((4 - base64String.length % 4) % 4);
        //     const base64 = (base64String + padding)
        //         .replace(/\-/g, '+')
        //         .replace(/_/g, '/');

        //     const rawData = window.atob(base64);
        //     const outputArray = new Uint8Array(rawData.length);

        //     for (let i = 0; i < rawData.length; ++i) {
        //         outputArray[i] = rawData.charCodeAt(i);
        //     }
        //     return outputArray;
        // }
    </script>
</body>
</html>