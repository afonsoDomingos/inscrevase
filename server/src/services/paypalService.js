const axios = require('axios');

class PayPalService {
    constructor() {
        this.clientId = (process.env.PAYPAL_CLIENT_ID || '').trim();
        this.clientSecret = (process.env.PAYPAL_SECRET || '').trim();
        this.mode = process.env.PAYPAL_MODE || 'sandbox';
        this.baseUrl = this.mode === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
    }

    async getAccessToken() {
        try {
            const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
            const response = await axios.post(
                `${this.baseUrl}/v1/oauth2/token`,
                'grant_type=client_credentials',
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
            return response.data.access_token;
        } catch (error) {
            console.error('❌ PayPal Auth Error:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with PayPal');
        }
    }

    async createOrder(orderData) {
        try {
            const token = await this.getAccessToken();
            const response = await axios.post(
                `${this.baseUrl}/v2/checkout/orders`,
                orderData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('❌ PayPal Create Order Error:', error.response?.data || error.message);
            throw error;
        }
    }

    async captureOrder(orderId) {
        try {
            const token = await this.getAccessToken();
            const response = await axios.post(
                `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('❌ PayPal Capture Order Error:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new PayPalService();
