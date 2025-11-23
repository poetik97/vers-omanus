import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Cookie, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { type CookieConsent } from '@/lib/cookieUtils';

interface CookiePreferencesProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CookiePreferences({ open, onOpenChange }: CookiePreferencesProps) {
    const { consent, updateConsent } = useCookieConsent();
    const [preferences, setPreferences] = useState<CookieConsent>(
        consent || {
            essential: true,
            analytics: false,
            marketing: false,
            timestamp: Date.now(),
        }
    );

    const handleSave = () => {
        updateConsent(preferences);
        onOpenChange(false);
    };

    const handleAcceptAll = () => {
        const allAccepted: CookieConsent = {
            essential: true,
            analytics: true,
            marketing: true,
            timestamp: Date.now(),
        };
        setPreferences(allAccepted);
        updateConsent(allAccepted);
        onOpenChange(false);
    };

    const handleRejectAll = () => {
        const allRejected: CookieConsent = {
            essential: true,
            analytics: false,
            marketing: false,
            timestamp: Date.now(),
        };
        setPreferences(allRejected);
        updateConsent(allRejected);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Cookie className="h-5 w-5 text-primary" />
                        <DialogTitle>Preferências de Cookies</DialogTitle>
                    </div>
                    <DialogDescription>
                        Gerencie suas preferências de cookies. Você pode alterar estas configurações a qualquer momento.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Respeitamos sua privacidade. Todos os cookies opcionais só serão utilizados com o seu consentimento
                            explícito, em conformidade com a GDPR (Europa) e LGPD (Brasil).
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                        {/* Essential Cookies */}
                        <div className="rounded-lg border bg-muted/50 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                    <Label className="text-base font-semibold">
                                        🔒 Cookies Essenciais
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Estes cookies são necessários para o funcionamento do site e não podem ser desativados.
                                        Incluem autenticação, segurança e preferências básicas.
                                    </p>
                                    <div className="text-xs text-muted-foreground mt-2">
                                        <strong>Exemplos:</strong> Token de sessão, preferências de idioma, segurança CSRF
                                    </div>
                                </div>
                                <Switch checked={true} disabled className="shrink-0 mt-1" />
                            </div>
                        </div>

                        {/* Analytics Cookies */}
                        <div className="rounded-lg border p-4 transition-colors hover:border-primary/50">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                    <Label htmlFor="analytics-pref" className="text-base font-semibold cursor-pointer">
                                        📊 Cookies de Análise
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Cookies que nos ajudam a entender como você usa o site, quais páginas são mais visitadas
                                        e como podemos melhorar sua experiência.
                                    </p>
                                    <div className="text-xs text-muted-foreground mt-2">
                                        <strong>Exemplos:</strong> Google Analytics, contagem de visitantes, tempo de navegação
                                    </div>
                                </div>
                                <Switch
                                    id="analytics-pref"
                                    checked={preferences.analytics}
                                    onCheckedChange={(checked) =>
                                        setPreferences({ ...preferences, analytics: checked })
                                    }
                                    className="shrink-0 mt-1"
                                />
                            </div>
                        </div>

                        {/* Marketing Cookies */}
                        <div className="rounded-lg border p-4 transition-colors hover:border-primary/50">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                    <Label htmlFor="marketing-pref" className="text-base font-semibold cursor-pointer">
                                        📢 Cookies de Marketing
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Cookies usados para personalizar anúncios e medir a eficácia de nossas campanhas de marketing.
                                        Podem rastrear sua atividade em diferentes sites.
                                    </p>
                                    <div className="text-xs text-muted-foreground mt-2">
                                        <strong>Exemplos:</strong> Facebook Pixel, Google Ads, remarketing
                                    </div>
                                </div>
                                <Switch
                                    id="marketing-pref"
                                    checked={preferences.marketing}
                                    onCheckedChange={(checked) =>
                                        setPreferences({ ...preferences, marketing: checked })
                                    }
                                    className="shrink-0 mt-1"
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button onClick={handleAcceptAll} variant="default" className="flex-1">
                            Aceitar Todos
                        </Button>
                        <Button onClick={handleRejectAll} variant="outline" className="flex-1">
                            Rejeitar Opcionais
                        </Button>
                        <Button onClick={handleSave} variant="secondary" className="flex-1">
                            Salvar Preferências
                        </Button>
                    </div>

                    <div className="text-xs text-center text-muted-foreground">
                        Para mais informações, consulte nossa{' '}
                        <a href="/privacy-policy" className="text-primary hover:underline">
                            Política de Privacidade
                        </a>{' '}
                        e{' '}
                        <a href="/cookie-policy" className="text-primary hover:underline">
                            Política de Cookies
                        </a>
                        .
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
