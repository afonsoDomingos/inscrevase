'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useEffect } from 'react';

/**
 * PayPalProviderWrapper
 * Carrega o SDK do PayPal UMA ÚNICA VEZ para toda a aplicação.
 */
export default function PayPalProviderWrapper({ children }: { children: React.ReactNode }) {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';

    useEffect(() => {
        if (clientId === 'test') {
            console.warn('⚠️ PayPal SDK: Carregando com ID de "test". Verifique as variáveis (.env).');
        } else {
            console.log(`🌐 PayPal SDK: Carregando com ID real (${clientId.substring(0, 10)}...)`);
        }
    }, [clientId]);

    return (
        <PayPalScriptProvider
            options={{
                clientId: clientId,
                currency: 'USD',
                intent: 'capture',
                'disable-funding': 'card,credit',
            }}
            deferLoading={false}
        >
            {children}
        </PayPalScriptProvider>
    );
}
