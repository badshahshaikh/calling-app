// sw.js
self.addEventListener('push', function(event) {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/4436/4436481.png'
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});