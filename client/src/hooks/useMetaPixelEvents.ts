// import { useEffect } from 'react';

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fbq: (...args: any[]) => void;
    }
}

export const useMetaPixelEvents = () => {
    // Track when someone views an event page
    const trackViewContent = (eventData: {
        content_name: string;
        content_category: string;
        value?: number;
        currency?: string;
    }) => {
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'ViewContent', eventData);
        }
    };

    // Track when someone starts filling the registration form
    const trackAddToCart = (eventData: {
        content_name: string;
        value?: number;
        currency?: string;
    }) => {
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'AddToCart', eventData);
        }
    };

    // Track when someone completes registration
    const trackPurchase = (eventData: {
        content_name: string;
        value: number;
        currency: string;
    }) => {
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'Purchase', eventData);
        }
    };

    // Track when someone clicks "Get Started"
    const trackLead = () => {
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'Lead');
        }
    };

    // Track when someone completes signup
    const trackCompleteRegistration = () => {
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'CompleteRegistration');
        }
    };

    return {
        trackViewContent,
        trackAddToCart,
        trackPurchase,
        trackLead,
        trackCompleteRegistration,
    };
};
