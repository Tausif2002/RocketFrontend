importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');


firebase.initializeApp({
    // EDITME:
    apiKey: 'APP_FIREBASE_API_KEY',
    authDomain: 'APP_FIREBASE_AUTH_DOMAIN',
    projectId: 'APP_FIREBASE_PROJECT_ID',
    storageBucket: 'APP_APP_FIREBASE_STORAGE_BUCKET',
    messagingSenderId: 'APP_FIREBASE_STORAGE_BUCKET',
    appId: 'APP_FIREBASE_APP_ID',
    measurementId: 'APP_FIREBASE_MEASUREMENT_ID',
});

const messaging = firebase.messaging();

try {
    messaging.setBackgroundMessageHandler(function (payload) {
        let data = payload?.notification;
        const notificationTitle = data?.title;
        const notificationOptions = {
            body: data?.body,
            icon: './logo.png' || 0,
            image: data?.image
        };

        return self.registration.showNotification(notificationTitle,
            notificationOptions);
    });

} catch (error) {
    console.log("This is an error ->", error);
}
