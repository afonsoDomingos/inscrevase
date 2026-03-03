require('dotenv').config();
const axios = require('axios');

async function testAuth() {
    const clientId = process.env.PAYPAL_CLIENT_ID.trim();
    const secret = process.env.PAYPAL_SECRET.trim();
    const mode = process.env.PAYPAL_MODE || 'sandbox';

    const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');
    const url = mode === 'live'
        ? 'https://api-m.paypal.com/v1/oauth2/token'
        : 'https://api-m.sandbox.paypal.com/v1/oauth2/token';

    console.log('Testing Authentication with Axios...');
    console.log('URL:', url);

    try {
        const response = await axios.post(url, 'grant_type=client_credentials', {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log('✅ Auth Successful!');
        console.log('Access Token (start):', response.data.access_token.substring(0, 20) + '...');
    } catch (error) {
        console.error('❌ Auth Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testAuth();
