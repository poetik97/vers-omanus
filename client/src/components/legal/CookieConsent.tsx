import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, CheckCircle2, XCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { DEFAULT_CONSENT, type CookieConsent } from '@/lib/cookieUtils';

export function CookieConsentBanner() {
    const { showBanner, acceptAll, rejectAll, updateConsent } = useCookieConsent();
    const [showCustomize, setShowCustomize] = useState(false);
    const [preferences, setPreferences] = useState<CookieConsent>({
        ...DEFAULT_CONSENT,
        timestamp: Date.now(),
    });

    if (!showBanner) return null;

    const handleSavePreferences = () => {
        updateConsent(preferences);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
            >
                <Card className="mx-auto max-w-4xl border-2 shadow-2xl backdrop-blur-sm bg-background/95">
                    <div className="p-6">
                        {!showCustomize ? (
                            // Simple banner view
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="rounded-full bg-primary/10 p-3">
                                        <Cookie className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <h3 className="text-lg font-semibold">
                                            🍪 Nós utilizamos cookies
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Utilizamos cookies essenciais para o funcionamento do site e cookies opcionais
                                            para melhorar sua experiência, conforme nossa{' '}
                                            <a href="/privacy-policy" className="text-primary hover:underline">
                                                Política de Privacidade
                                            </a>
                                            . Você pode aceitar todos, rejeitar os opcionais ou personalizar suas preferências.
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        onClick={acceptAll}
                                        className="flex-1 gap-2"
                                        size="lg"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Aceitar Todos
                                    </Button>
                                    <Button
                                        onClick={rejectAll}
                                        variant="outline"
                                        className="flex-1 gap-2"
                                        size="lg"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Rejeitar Opcionais
                                    </Button>
                                    <Button
                                        onClick={() => setShowCustomize(true)}
                                        variant="secondary"
                                        className="flex-1 gap-2"
                                        size="lg"
                                    >
                                        <Settings className="h-4 w-4" />
                                        Personalizar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            // Customize view
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <Cookie className="h-6 w-6 text-primary" />
                                    <h3 className="text-lg font-semibold">
                                        Preferências de Cookies
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    {/* Essential Cookies - Always on */}
                                    <div className="rounded-lg border bg-muted/50 p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1 flex-1">
                                                <Label className="text-base font-medium">
                                                    Cookies Essenciais
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Necessários para o funcionamento básico do site. Não podem ser desativados.
                                                </p>
                                            </div>
                                            <Switch checked={true} disabled className="shrink-0" />
                                        </div>
                                    </div>

                                    {/* Analytics Cookies */}
                                    <div className="rounded-lg border p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1 flex-1">
                                                <Label htmlFor="analytics" className="text-base font-medium cursor-pointer">
                                                    Cookies de Análise
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Ajudam-nos a entender como você usa o site para melhorar a experiência.
                                                </p>
                                            </div>
                                            <Switch
                                                id="analytics"
                                                checked={preferences.analytics}
                                                onCheckedChange={(checked) =>
                                                    setPreferences({ ...preferences, analytics: checked })
                                                }
                                                className="shrink-0"
                                            />
                                        </div>
                                    </div>

                                    {/* Marketing Cookies */}
                                    <div className="rounded-lg border p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1 flex-1">
                                                <Label htmlFor="marketing" className="text-base font-medium cursor-pointer">
                                                    Cookies de Marketing
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Usados para personalizar anúncios e medir o desempenho de campanhas.
                                                </p>
                                            </div>
                                            <Switch
                                                id="marketing"
                                                checked={preferences.marketing}
                                                onCheckedChange={(checked) =>
                                                    setPreferences({ ...preferences, marketing: checked })
                                                }
                                                className="shrink-0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        onClick={handleSavePreferences}
                                        className="flex-1"
                                        size="lg"
                                    >
                                        Salvar Preferências
                                    </Button>
                                    <Button
                                        onClick={() => setShowCustomize(false)}
                                        variant="outline"
                                        className="flex-1"
                                        size="lg"
                                    >
                                        Voltar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}
