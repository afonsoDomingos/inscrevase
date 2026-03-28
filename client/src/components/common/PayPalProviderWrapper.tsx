'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';

/**
 * PayPalProviderWrapper
 * Carrega o SDK do PayPal UMA ÚNICA VEZ para toda a aplicação.
 * Coloca este componente no layout raiz para evitar re-carregamentos em cada botão.
 */
export default function PayPalProviderWrapper({ children }: { children: React.ReactNode }) {
    return (
        <PayPalScriptProvider
            options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test',
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
