'use client';

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { toast } from "sonner";
import Cookies from 'js-cookie';

export interface PaypalSuccessDetails {
    success: boolean;
    submissionId?: string;
    type?: 'subscription' | 'event_registration';
    plan?: string;
}

interface PaypalButtonProps {
    type: 'subscription' | 'event_registration';
    planId?: string;
    formId?: string;
    submissionData?: Record<string, unknown>;
    currency: string;
    amount?: number;
    onSuccess: (data: PaypalSuccessDetails) => void;
}

export default function PaypalButton({ type, planId, formId, submissionData, currency, onSuccess }: PaypalButtonProps) {
    const initialOptions = {
        clientId: "AS1xD4Kyd47LhMoxG0rDQesHp5HfV_8Gf4mmAwAAuT8Nez8o91-s3s5XIn9rLn-0U0p3sgD2_r3ilGF6",
        currency: ['USD', 'EUR', 'BRL', 'GBP'].includes(currency) ? currency : 'USD', // Fallback to USD for script loading if currency is PALOP
        intent: "capture",
    };

    const createOrder = async () => {
        try {
            const token = Cookies.get('token');
            const endpoint = type === 'subscription'
                ? `${process.env.NEXT_PUBLIC_API_URL}/paypal/subscription/create`
                : `${process.env.NEXT_PUBLIC_API_URL}/paypal/checkout/create`;

            const body = type === 'subscription'
                ? { plan: planId, currency }
                : { formId, submissionData };

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(body),
            });

            const order = await response.json();
            if (!order.id) throw new Error("Could not create PayPal order");
            return order.id;
        } catch (err) {
            console.error(err);
            toast.error("Erro ao iniciar PayPal");
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

            const details = (await response.json()) as PaypalSuccessDetails;
            if (details.success) {
                toast.success("Pagamento confirmado via PayPal!");
                onSuccess(details);
            } else {
                throw new Error("Capture failed");
            }
        } catch (err) {
            console.error(err);
            toast.error("Erro ao confirmar pagamento no PayPal");
        }
    };

    return (
        <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons
                style={{ layout: "vertical", shape: "pill", height: 45 }}
                createOrder={createOrder}
                onApprove={onApprove}
            />
        </PayPalScriptProvider>
    );
}
