const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
let expo = new Expo();

// Your user's Expo push token
let pushToken = 'ExponentPushToken[h_4a6MHyV7sezy-LdMObpV]';

async function sendNotification() {
    // Check if token is valid
    if (!Expo.isExpoPushToken(pushToken)) {
        console.error('Invalid Expo push token');
        return;
    }

    const messages = [
        {
            to: pushToken,
            sound: 'default',
            title: 'Hello 👋',
            body: 'This is from Node.js backend',
            data: { screen: 'home' },
        },
    ];

    try {
        let chunks = expo.chunkPushNotifications(messages);
        let tickets = [];

        for (let chunk of chunks) {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        }

        console.log('Notification sent:', tickets);
    } catch (error) {
        console.error(error);
    }
}

module.exports = { sendNotification };
