const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('--- COPIA ESTAS CHAVES PARA O TEU RENDER.COM ---');
console.log('');
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('');
console.log('----------------------------------------------');
