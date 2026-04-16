'use client';

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { toast } from "sonner";
import Cookies from 'js-cookie';
import { logService } from '@/lib/logService';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adData?: any;
    submissionData?: Record<string, unknown>;
    currency: string;
    amount?: number;
    trial?: boolean; // New prop
    onSuccess: (data: PaypalSuccessDetails) => void;
}

export default function PaypalButton({ type, planId, formId, submissionData, adData, currency, trial, onSuccess }: PaypalButtonProps) {
    // O SDK já está carregado via PayPalProviderWrapper no layout global
    const [{ isPending, isRejected }] = usePayPalScriptReducer();

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
            if (type === 'subscription') {
                body = { plan: planId, currency, trial };
            } else if (type === 'ad_checkout') {
                body = { adData, currency };
            } else {
                body = { formId, submissionData, currency };
            }

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

            const result = await response.json(); console.log('PAYPAL CREATE RAW RESPONSE:', result);
            
            // If it's a recurring subscription, PayPal expects the subscription data
            if (result.isRecurring) {
                toast.dismiss(loadingToast);
                return result.id; // This will go to createSubscription
            }

            if (!result.id) throw new Error("Could not create PayPal order/subscription. Empty ID returned.");

            toast.dismiss(loadingToast);
            return result.id;
        } catch (err: unknown) {
            const error = err as Error;
            console.error('\n❌ Frontend PayPal Create Error:', err);
            toast.dismiss(loadingToast);
            toast.error(`Erro ao iniciar PayPal: ${error.message || 'Verifique a ligação'}`);
            throw err;
        }
    };

    const onApprove = async (data: { orderID?: string; subscriptionID?: string | null }) => {
        try {
            console.log('✅ PayPal onApprove Data:', data);

            // For recurring subscriptions, the plan is already activated via webhook (ideally)
            // or we can verify it here.
            if (data.subscriptionID) {
                toast.success("Subscrição iniciada com sucesso!");
                onSuccess({ success: true, type: 'subscription', plan: planId });
                return;
            }

            const logType = type === 'ad_checkout' ? 'ad_purchase' : type as 'subscription' | 'event_registration';
            logService.logPaymentAttempt({
                type: logType,
                method: 'paypal',
                status: 'capture_started',
                metadata: { orderID: data.orderID }
            });

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
                logService.logPaymentAttempt({
                    type: logType,
                    method: 'paypal',
                    status: 'capture_failed',
                    metadata: { orderID: data.orderID, error: errorData, status: response.status }
                });
                throw new Error(`Server Error: ${response.status} - ${errorData}`);
            }

            const details = (await response.json()) as PaypalSuccessDetails;
            if (details.success) {
                toast.success("Pagamento confirmado via PayPal!");
                logService.logPaymentAttempt({
                    type: logType,
                    method: 'paypal',
                    status: 'completed',
                    metadata: { orderID: data.orderID }
                });
                onSuccess(details);
            } else {
                logService.logPaymentAttempt({
                    type: logType,
                    method: 'paypal',
                    status: 'capture_failed',
                    metadata: { orderID: data.orderID, error: "Backend returned success: false" }
                });
                throw new Error("Capture failed. Backend explicitly returned success: false");
            }
        } catch (err) {
            const error = err as Error;
            console.error('\n❌ Frontend PayPal Capture Error:', err);
            toast.error(`Erro ao confirmar pagamento: ${error.message || 'Falha no PayPal'}`);
        }
    };

    // SDK ainda a carregar
    if (isPending) {
        return (
            <div style={{
                height: '45px',
                background: 'rgba(255,196,57,0.3)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                color: '#5a3e00',
                fontWeight: 700,
                gap: '8px'
            }}>
                <span className="animate-spin" style={{ fontSize: '1rem' }}>⏳</span>
                A carregar PayPal...
            </div>
        );
    }

    if (isRejected) {
        return (
            <div style={{
                height: '45px',
                background: 'rgba(239,68,68,0.1)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                color: '#dc2626',
                fontWeight: 700
            }}>
                ⚠️ PayPal indisponível
            </div>
        );
    }

    // Toggle between createOrder and createSubscription based on whether it's a trial/recurring
    // All subscriptions should be recurring to support the automated lifecycle system
    const isRecurring = type === 'subscription';

    return (
        <PayPalButtons
            style={{ layout: "vertical", shape: "rect", height: 45 }}
            createOrder={!isRecurring ? createOrder : undefined}
            createSubscription={isRecurring ? createOrder : undefined}
            onApprove={onApprove}
        />
    );
}
