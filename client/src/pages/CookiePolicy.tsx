import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Cookie, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useState } from 'react';
import { CookiePreferences } from '@/components/legal/CookiePreferences';

export default function CookiePolicy() {
    const [showPreferences, setShowPreferences] = useState(false);
    const lastUpdated = '22 de Novembro de 2025';

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="container max-w-4xl mx-auto py-12 px-4">
                <div className="space-y-6">
                    <div className="mb-6">
                        <Link href="/">
                            <Button variant="ghost" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Voltar
                            </Button>
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="rounded-full bg-primary/10 p-4">
                                <Cookie className="h-10 w-10 text-primary" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold">Política de Cookies</h1>
                        <p className="text-muted-foreground">
                            Última atualização: {lastUpdated}
                        </p>
                        <Button onClick={() => setShowPreferences(true)} size="lg">
                            <Cookie className="h-4 w-4 mr-2" />
                            Gerenciar Preferências de Cookies
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <ScrollArea className="h-[600px] pr-4">
                                <div className="space-y-8">
                                    {/* What are cookies */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">1. O que são Cookies?</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo (computador,
                                            tablet ou celular) quando você visita um site. Eles permitem que o site "lembre" suas ações
                                            e preferências ao longo do tempo, para que você não precise reinseri-las sempre que voltar
                                            ao site ou navegar de uma página para outra.
                                        </p>
                                    </section>

                                    <Separator />

                                    {/* How we use cookies */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">2. Como Utilizamos Cookies</h2>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            Utilizamos cookies para melhorar sua experiência no Organiza-te360. Os cookies nos ajudam a:
                                        </p>
                                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                                            <li>Manter você conectado à sua conta</li>
                                            <li>Lembrar suas preferências e configurações</li>
                                            <li>Entender como você usa o site</li>
                                            <li>Melhorar o desempenho e a segurança</li>
                                            <li>Personalizar conteúdo e anúncios (apenas com seu consentimento)</li>
                                        </ul>
                                    </section>

                                    <Separator />

                                    {/* Types of cookies */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">3. Tipos de Cookies que Utilizamos</h2>

                                        <div className="space-y-6">
                                            {/* Essential Cookies */}
                                            <div className="p-4 border-l-4 border-green-500 bg-green-500/10">
                                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                                    <span className="text-2xl">🔒</span>
                                                    Cookies Essenciais (Sempre Ativos)
                                                </h3>
                                                <p className="text-muted-foreground mb-3">
                                                    Estes cookies são absolutamente necessários para que o site funcione corretamente.
                                                    Eles não podem ser desativados.
                                                </p>
                                                <div className="bg-background rounded-lg p-3 space-y-2">
                                                    <div>
                                                        <strong className="text-sm">organiza-te-session</strong>
                                                        <p className="text-xs text-muted-foreground">
                                                            Duração: Sessão | Propósito: Mantém você conectado
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <strong className="text-sm">organiza-te-auth</strong>
                                                        <p className="text-xs text-muted-foreground">
                                                            Duração: 7 dias | Propósito: Autenticação segura
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <strong className="text-sm">organiza-te-cookie-consent</strong>
                                                        <p className="text-xs text-muted-foreground">
                                                            Duração: 1 ano | Propósito: Armazena suas preferências de cookies
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <strong className="text-sm">csrf-token</strong>
                                                        <p className="text-xs text-muted-foreground">
                                                            Duração: Sessão | Propósito: Proteção contra ataques CSRF
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Analytics Cookies */}
                                            <div className="p-4 border-l-4 border-blue-500 bg-blue-500/10">
                                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                                    <span className="text-2xl">📊</span>
                                                    Cookies de Análise (Opcionais)
                                                </h3>
                                                <p className="text-muted-foreground mb-3">
                                                    Estes cookies nos ajudam a entender como os visitantes interagem com o site,
                                                    coletando e relatando informações anonimamente. Requer seu consentimento.
                                                </p>
                                                <div className="bg-background rounded-lg p-3 space-y-2">
                                                    <div>
                                                        <strong className="text-sm">_ga</strong>
                                                        <p className="text-xs text-muted-foreground">
                                                            Duração: 2 anos | Provedor: Google Analytics | Propósito: Distingue visitantes únicos
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <strong className="text-sm">_gid</strong>
                                                        <p className="text-xs text-muted-foreground">
                                                            Duração: 24 horas | Provedor: Google Analytics | Propósito: Distingue visitantes únicos
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <strong className="text-sm">_gat</strong>
                                                        <p className="text-xs text-muted-foreground">
                                                            Duração: 1 minuto | Provedor: Google Analytics | Propósito: Limita taxa de solicitações
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <strong className="text-sm">umami-*</strong>
                                                        <p className="text-xs text-muted-foreground">
                                                            Duração: 1 ano | Provedor: Umami Analytics | Propósito: Análise de uso respeitosa à privacidade
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Marketing Cookies */}
                                            <div className="p-4 border-l-4 border-purple-500 bg-purple-500/10">
                                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                                    <span className="text-2xl">📢</span>
                                                    Cookies de Marketing (Opcionais)
                                                </h3>
                                                <p className="text-muted-foreground mb-3">
                                                    Estes cookies são usados para rastrear visitantes em sites. A intenção é exibir
                                                    anúncios relevantes e envolventes. Requer seu consentimento.
                                                </p>
                                                <div className="bg-background rounded-lg p-3 space-y-2">
                                                    <div>
                                                        <strong className="text-sm">_fbp</strong>
                                                        <p className="text-xs text-muted-foreground">
                                                            Duração: 3 meses | Provedor: Facebook | Propósito: Rastreamento para anúncios do Facebook
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <strong className="text-sm">fr</strong>
                                                        <p className="text-xs text-muted-foreground">
                                                            Duração: 3 meses | Provedor: Facebook | Propósito: Publicidade direcionada
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <strong className="text-sm">IDE</strong>
                                                        <p className="text-xs text-muted-foreground">
                                                            Duração: 1 ano | Provedor: Google | Propósito: Mede eficácia de anúncios
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <Separator />

                                    {/* Third Party Cookies */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">4. Cookies de Terceiros</h2>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            Além dos nossos próprios cookies, também podemos usar cookies de terceiros para:
                                        </p>
                                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                                            <li>
                                                <strong>Google Analytics:</strong> Para análise de tráfego e comportamento do usuário
                                            </li>
                                            <li>
                                                <strong>Google OAuth:</strong> Para login com conta Google
                                            </li>
                                            <li>
                                                <strong>Facebook Pixel:</strong> Para remarketing e análise de conversões (apenas com consentimento)
                                            </li>
                                        </ul>
                                    </section>

                                    <Separator />

                                    {/* Cookie Duration */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">5. Duração dos Cookies</h2>
                                        <div className="space-y-3">
                                            <div className="p-3 bg-muted rounded-lg">
                                                <strong>Cookies de Sessão:</strong>
                                                <p className="text-sm text-muted-foreground">
                                                    Temporários e expiram quando você fecha o navegador
                                                </p>
                                            </div>
                                            <div className="p-3 bg-muted rounded-lg">
                                                <strong>Cookies Persistentes:</strong>
                                                <p className="text-sm text-muted-foreground">
                                                    Permanecem no seu dispositivo por um período específico ou até serem excluídos manualmente
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    <Separator />

                                    {/* Managing Cookies */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">6. Como Gerenciar Cookies</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="font-semibold mb-2">6.1. Preferências no Site</h3>
                                                <p className="text-muted-foreground mb-3">
                                                    Você pode gerenciar suas preferências de cookies a qualquer momento clicando no botão abaixo:
                                                </p>
                                                <Button onClick={() => setShowPreferences(true)} variant="outline">
                                                    <Cookie className="h-4 w-4 mr-2" />
                                                    Abrir Preferências de Cookies
                                                </Button>
                                            </div>

                                            <div>
                                                <h3 className="font-semibold mb-2">6.2. Configurações do Navegador</h3>
                                                <p className="text-muted-foreground mb-3">
                                                    Você também pode controlar cookies através das configurações do seu navegador:
                                                </p>
                                                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 text-sm">
                                                    <li>
                                                        <strong>Chrome:</strong> Configurações → Privacidade e segurança → Cookies
                                                    </li>
                                                    <li>
                                                        <strong>Firefox:</strong> Opções → Privacidade e Segurança → Cookies
                                                    </li>
                                                    <li>
                                                        <strong>Safari:</strong> Preferências → Privacidade → Cookies
                                                    </li>
                                                    <li>
                                                        <strong>Edge:</strong> Configurações → Cookies e permissões de site
                                                    </li>
                                                </ul>
                                                <p className="text-xs text-muted-foreground mt-3">
                                                    ⚠️ Nota: Bloquear todos os cookies pode afetar a funcionalidade do site.
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    <Separator />

                                    {/* Your Consent */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">7. Seu Consentimento</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Quando você visita nosso site pela primeira vez, pedimos seu consentimento para usar cookies
                                            não essenciais. Você tem controle total:
                                        </p>
                                        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-3">
                                            <li>Aceitar todos os cookies</li>
                                            <li>Rejeitar cookies opcionais (manter apenas essenciais)</li>
                                            <li>Personalizar quais categorias aceitar</li>
                                            <li>Alterar suas preferências a qualquer momento</li>
                                        </ul>
                                    </section>

                                    <Separator />

                                    {/* GDPR/LGPD */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">8. Conformidade com GDPR e LGPD</h2>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            Nossa política de cookies está em total conformidade com:
                                        </p>
                                        <div className="space-y-3">
                                            <div className="p-3 bg-primary/10 rounded-lg">
                                                <strong>🇪🇺 GDPR (União Europeia):</strong>
                                                <p className="text-sm text-muted-foreground">
                                                    Regulamento Geral de Proteção de Dados - garante que você controla seus dados
                                                </p>
                                            </div>
                                            <div className="p-3 bg-primary/10 rounded-lg">
                                                <strong>🇧🇷 LGPD (Brasil):</strong>
                                                <p className="text-sm text-muted-foreground">
                                                    Lei Geral de Proteção de Dados - protege seus dados pessoais
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    <Separator />

                                    {/* Updates */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">9. Atualizações desta Política</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Podemos atualizar esta Política de Cookies ocasionalmente para refletir mudanças em nossa
                                            prática de cookies ou por outros motivos operacionais, legais ou regulamentares. Verifique
                                            esta página regularmente para se manter informado.
                                        </p>
                                    </section>

                                    <Separator />

                                    {/* Contact */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">10. Contato</h2>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            Para questões sobre nossa política de cookies:
                                        </p>
                                        <div className="p-4 bg-primary/10 rounded-lg">
                                            <p>
                                                <strong>Email:</strong> privacy@organiza-te360.com
                                            </p>
                                        </div>
                                    </section>

                                    <Separator />

                                    {/* More Information */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">11. Mais Informações</h2>
                                        <p className="text-muted-foreground leading-relaxed mb-3">
                                            Para saber mais sobre como protegemos seus dados:
                                        </p>
                                        <div className="flex flex-col gap-2">
                                            <a
                                                href="/privacy-policy"
                                                className="text-primary hover:underline flex items-center gap-2"
                                            >
                                                → Leia nossa Política de Privacidade
                                            </a>
                                            <a
                                                href="/terms-of-service"
                                                className="text-primary hover:underline flex items-center gap-2"
                                            >
                                                → Leia nossos Termos de Serviço
                                            </a>
                                        </div>
                                    </section>
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <CookiePreferences open={showPreferences} onOpenChange={setShowPreferences} />
        </div>
    );
}
