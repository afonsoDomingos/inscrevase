'use client';

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { toast } from "sonner";
import Cookies from 'js-cookie';

export interface PaypalSuccessDetails {
    success: boolean;
    submissionId?: string;
    type?: 'subscription' | 'event_registration' | 'ad_checkout';
    plan?: string;
    adId?: string;
}

interface PaypalButtonProps {
    type: 'subscription' | 'event_registration' | 'ad_checkout';
    planId?: string;
    formId?: string;
    adData?: Record<string, unknown>;
    submissionData?: Record<string, unknown>;
    currency: string;
    amount?: number;
    onSuccess: (data: PaypalSuccessDetails) => void;
}

export default function PaypalButton({ type, planId, formId, submissionData, adData, currency, onSuccess }: PaypalButtonProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const initialOptions: any = {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
        currency: ['USD', 'EUR', 'BRL', 'GBP'].includes(currency) ? currency : 'USD',
        intent: "capture",
        "disable-funding": "card,credit",
    };

    const createOrder = async () => {
        const loadingToast = toast.loading("Preparando ambiente seguro PayPal...", { duration: 25000 });
        try {
            const token = Cookies.get('token');
            let endpoint = type === 'subscription'
                ? `${process.env.NEXT_PUBLIC_API_URL}/paypal/subscription/create`
                : `${process.env.NEXT_PUBLIC_API_URL}/paypal/checkout/create`;
            
            if (type === 'ad_checkout') {
                endpoint = `${process.env.NEXT_PUBLIC_API_URL}/paypal/checkout/ad`;
            }

            let body: Record<string, unknown> = {};
            if (type === 'subscription') body = { plan: planId, currency };
            else if (type === 'ad_checkout') body = { adData, currency };
            else body = { formId, submissionData, currency };

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Server Error: ${response.status} - ${errorData}`);
            }

            const order = await response.json();
            if (!order.id) throw new Error("Could not create PayPal order. Empty ID returned.");

            toast.dismiss(loadingToast);
            return order.id;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('\n❌ Frontend PayPal Create Error:', err);
            toast.dismiss(loadingToast);
            toast.error(`Erro ao iniciar PayPal: ${err.message || 'Verifique a ligação'}`);
            throw err;
        }
    };

    const onApprove = async (data: { orderID: string }) => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/paypal/orders/capture`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    orderID: data.orderID,
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Server Error: ${response.status} - ${errorData}`);
            }

            const details = (await response.json()) as PaypalSuccessDetails;
            if (details.success) {
                toast.success("Pagamento confirmado via PayPal!");
                onSuccess(details);
            } else {
                throw new Error("Capture failed. Backend explicitly returned success: false");
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('\n❌ Frontend PayPal Capture Error:', err);
            toast.error(`Erro ao confirmar pagamento: ${err.message || 'Falha no PayPal'}`);
        }
    };

    return (
        <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons
                style={{ layout: "vertical", shape: "rect", height: 45 }}
                createOrder={createOrder}
                onApprove={onApprove}
            />
        </PayPalScriptProvider>
    );
}
