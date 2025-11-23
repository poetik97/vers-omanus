// Cookie consent types
export interface CookieConsent {
    essential: boolean; // Required, always true
    analytics: boolean; // Google Analytics, tracking, etc.
    marketing: boolean; // Marketing cookies, ads, etc.
    timestamp: number;
}

export const DEFAULT_CONSENT: CookieConsent = {
    essential: true,
    analytics: false,
    marketing: false,
    timestamp: Date.now(),
};

const CONSENT_KEY = 'organiza-te-cookie-consent';
const CONSENT_VERSION = '1.0';

/**
 * Get the user's cookie consent preferences
 */
export function getCookieConsent(): CookieConsent | null {
    try {
        const stored = localStorage.getItem(CONSENT_KEY);
        if (!stored) return null;

        const data = JSON.parse(stored);
        // Validate the structure
        if (typeof data.essential === 'boolean' &&
            typeof data.analytics === 'boolean' &&
            typeof data.marketing === 'boolean') {
            return data;
        }
        return null;
    } catch (error) {
        console.error('Error reading cookie consent:', error);
        return null;
    }
}

/**
 * Save cookie consent preferences
 */
export function saveCookieConsent(consent: CookieConsent): void {
    try {
        localStorage.setItem(CONSENT_KEY, JSON.stringify({
            ...consent,
            version: CONSENT_VERSION,
            timestamp: Date.now(),
        }));
    } catch (error) {
        console.error('Error saving cookie consent:', error);
    }
}

/**
 * Clear all cookie consent preferences
 */
export function clearCookieConsent(): void {
    try {
        localStorage.removeItem(CONSENT_KEY);
    } catch (error) {
        console.error('Error clearing cookie consent:', error);
    }
}

/**
 * Check if user has given consent for a specific category
 */
export function hasConsent(category: keyof CookieConsent): boolean {
    const consent = getCookieConsent();
    if (!consent) return false;
    return consent[category] === true;
}

/**
 * Set a cookie with consent check
 */
export function setCookie(
    name: string,
    value: string,
    days: number = 365,
    category: 'essential' | 'analytics' | 'marketing' = 'essential'
): boolean {
    // Always allow essential cookies
    if (category !== 'essential' && !hasConsent(category)) {
        console.warn(`Cannot set ${category} cookie without consent:`, name);
        return false;
    }

    try {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
        return true;
    } catch (error) {
        console.error('Error setting cookie:', error);
        return false;
    }
}

/**
 * Get a cookie value
 */
export function getCookie(name: string): string | null {
    try {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    } catch (error) {
        console.error('Error getting cookie:', error);
        return null;
    }
}

/**
 * Delete a specific cookie
 */
export function deleteCookie(name: string): void {
    try {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    } catch (error) {
        console.error('Error deleting cookie:', error);
    }
}

/**
 * Clear all non-essential cookies
 */
export function clearNonEssentialCookies(): void {
    try {
        const consent = getCookieConsent();
        if (!consent) return;

        // List of essential cookies that should never be deleted
        const essentialCookies = ['organiza-te-auth', 'organiza-te-session'];

        // Get all cookies
        const cookies = document.cookie.split(';');

        cookies.forEach(cookie => {
            const cookieName = cookie.split('=')[0].trim();

            // Skip essential cookies
            if (essentialCookies.includes(cookieName)) return;

            // Delete non-essential cookies
            deleteCookie(cookieName);
        });

        // Also clear localStorage items related to analytics/marketing
        if (!consent.analytics) {
            localStorage.removeItem('analytics-data');
            localStorage.removeItem('ga-client-id');
        }

        if (!consent.marketing) {
            localStorage.removeItem('marketing-preferences');
        }
    } catch (error) {
        console.error('Error clearing non-essential cookies:', error);
    }
}

/**
 * Accept all cookies
 */
export function acceptAllCookies(): void {
    saveCookieConsent({
        essential: true,
        analytics: true,
        marketing: true,
        timestamp: Date.now(),
    });
}

/**
 * Reject all non-essential cookies
 */
export function rejectAllCookies(): void {
    saveCookieConsent({
        essential: true,
        analytics: false,
        marketing: false,
        timestamp: Date.now(),
    });
    clearNonEssentialCookies();
}

/**
 * Check if user needs to see cookie consent banner
 */
export function needsCookieConsent(): boolean {
    return getCookieConsent() === null;
}
