const cloudinary = require('cloudinary').v2;
require('dotenv').config();

console.log('[Cloudinary Config] Verificando envs...');
console.log('[Cloudinary Config] Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'OK' : 'FALTANDO');
console.log('[Cloudinary Config] API Key:', process.env.CLOUDINARY_API_KEY ? 'OK' : 'FALTANDO');
console.log('[Cloudinary Config] API Secret:', process.env.CLOUDINARY_API_SECRET ? 'OK' : 'FALTANDO');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
