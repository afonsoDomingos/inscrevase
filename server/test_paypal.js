const { Client, Environment, OrdersController } = require('@paypal/paypal-server-sdk');

const client = new Client({
    clientCredentialsAuthCredentials: {
        clientId: 'ASg5L06R71_X900A4A0A4B',
        clientSecret: 'ECA9'
    },
    environment: Environment.Sandbox
});

const ordersController = new OrdersController(client);

async function test() {
    try {
        const body = {
            intent: 'CAPTURE',
            purchaseUnits: [{
                amount: { currencyCode: 'USD', value: '10.00' },
                description: 'Test'
            }]
        };
        console.log('Testing createOrder syntax...');
        const res = await ordersController.createOrder({ body });
        console.log('Success:', res.statusCode);
    } catch (err) {
        console.log('Error Name:', err.name);
        console.log('Error Message:', err.message);
    }
}

test();
