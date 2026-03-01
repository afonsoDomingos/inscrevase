const { Client, Environment, OrdersController } = require('@paypal/paypal-server-sdk');
const client = new Client({
    clientCredentialsAuthCredentials: { clientId: 'id', clientSecret: 'secret' },
    environment: Environment.Sandbox,
});
const ordersController = new OrdersController(client);
console.log('Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(ordersController)));
