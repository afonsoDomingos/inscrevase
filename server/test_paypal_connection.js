require('dotenv').config();
const { Client, Environment, OrdersController } = require('@paypal/paypal-server-sdk');

async function testConnection() {
    const client = new Client({
        clientCredentialsAuthCredentials: {
            clientId: process.env.PAYPAL_CLIENT_ID.trim(),
            clientSecret: process.env.PAYPAL_SECRET.trim(),
        },
        environment: process.env.PAYPAL_MODE === 'live' ? Environment.Live : Environment.Sandbox,
    });

    const ordersController = new OrdersController(client);

    try {
        console.log('--- Testing PayPal Connection ---');
        console.log('Environment:', process.env.PAYPAL_MODE);
        console.log('Client ID (start):', process.env.PAYPAL_CLIENT_ID.substring(0, 10) + '...');

        const body = {
            intent: 'CAPTURE',
            purchaseUnits: [
                {
                    amount: {
                        currencyCode: 'USD',
                        value: '1.00',
                    }
                }
            ]
        };

        const { result } = await ordersController.createOrder({ body });
        console.log('✅ Connection Successful!');
        console.log('Order ID:', result.id);
        console.log('Order Status:', result.status);
    } catch (error) {
        console.error('❌ Connection Failed!');
        console.error('Message:', error.message);
        if (error.response) {
            console.error('Details:', JSON.stringify(error.response.body, null, 2));
        } else {
            console.error('Error Object:', error);
        }
    }
}

testConnection();
