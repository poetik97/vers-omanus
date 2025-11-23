import { useState, useEffect } from 'react';
import {
    getCookieConsent,
    saveCookieConsent,
    needsCookieConsent,
    acceptAllCookies,
    rejectAllCookies,
    clearNonEssentialCookies,
    type CookieConsent,
} from '@/lib/cookieUtils';

export function useCookieConsent() {
    const [consent, setConsent] = useState<CookieConsent | null>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedConsent = getCookieConsent();
        setConsent(storedConsent);
        setShowBanner(needsCookieConsent());
        setIsLoading(false);
    }, []);

    const updateConsent = (newConsent: CookieConsent) => {
        saveCookieConsent(newConsent);
        setConsent(newConsent);
        setShowBanner(false);

        // Clear cookies if consent was revoked
        clearNonEssentialCookies();
    };

    const acceptAll = () => {
        acceptAllCookies();
        setConsent(getCookieConsent());
        setShowBanner(false);
    };

    const rejectAll = () => {
        rejectAllCookies();
        setConsent(getCookieConsent());
        setShowBanner(false);
    };

    const openPreferences = () => {
        setShowBanner(true);
    };

    return {
        consent,
        showBanner,
        isLoading,
        updateConsent,
        acceptAll,
        rejectAll,
        openPreferences,
        hasConsent: !!consent,
    };
}
