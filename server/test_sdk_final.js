require('dotenv').config();
const { Client, Environment, OrdersController } = require('@paypal/paypal-server-sdk');

const clientId = "AcVJPpalEyGEKyLOpy5amLu7KSJJOaipUYNOVyH1JgAL_ZJztWcfljrxlxNnosXZeKVzJ9c9e25FIT69";
const clientSecret = "EC9A4HadyrlBLG0m6fDY6mMQgF3tPWyEc3FS_x4k1x0tVLBKcj-JTW7hq-8_e4vdvHYt1I_Ti-8v0AsB";

async function testSDK() {
    const client = new Client({
        clientCredentialsAuthCredentials: {
            clientId: clientId,
            clientSecret: clientSecret,
        },
        environment: Environment.Sandbox,
    });

    const ordersController = new OrdersController(client);

    try {
        const body = {
            intent: 'CAPTURE',
            purchaseUnits: [{
                amount: {
                    currencyCode: 'USD',
                    value: '10.00'
                }
            }]
        };
        const { result } = await ordersController.createOrder({ body });
        console.log('SUCCESS:', result.id);
    } catch (error) {
        console.log('SDK ERROR:', error);
        if (error.response) {
            console.log('STATUS:', error.response.statusCode);
            console.log('BODY:', error.response.body);
        }
    }
}

testSDK();
