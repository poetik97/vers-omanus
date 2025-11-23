import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, Mail, Lock, Eye, Database, UserX, AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function PrivacyPolicy() {
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
                                <Shield className="h-10 w-10 text-primary" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold">Política de Privacidade</h1>
                        <p className="text-muted-foreground">
                            Última atualização: {lastUpdated}
                        </p>
                    </div>

                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Seu direito à privacidade</AlertTitle>
                        <AlertDescription>
                            Esta política está em conformidade com a GDPR (Regulamento Geral de Proteção de Dados da UE)
                            e a LGPD (Lei Geral de Proteção de Dados do Brasil). Seus dados são protegidos e você tem
                            controle total sobre eles.
                        </AlertDescription>
                    </Alert>

                    <Card>
                        <CardContent className="pt-6">
                            <ScrollArea className="h-[600px] pr-4">
                                <div className="space-y-8">
                                    {/* Introduction */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">1. Introdução</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Bem-vindo ao Organiza-te360. Respeitamos sua privacidade e estamos comprometidos em proteger
                                            seus dados pessoais. Esta política de privacidade informa como tratamos seus dados pessoais
                                            quando você visita nosso site e informa sobre seus direitos de privacidade.
                                        </p>
                                    </section>

                                    <Separator />

                                    {/* Data Controller */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Lock className="h-5 w-5 text-primary" />
                                            <h2 className="text-2xl font-semibold">2. Controlador de Dados</h2>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed">
                                            O controlador de dados responsável pelos seus dados pessoais é o Organiza-te360.
                                            Para questões relacionadas à privacidade, entre em contato conosco através de:
                                        </p>
                                        <div className="mt-4 p-4 bg-muted rounded-lg">
                                            <p className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                <strong>Email:</strong> privacy@organiza-te360.com
                                            </p>
                                        </div>
                                    </section>

                                    <Separator />

                                    {/* Data Collection */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Database className="h-5 w-5 text-primary" />
                                            <h2 className="text-2xl font-semibold">3. Dados que Coletamos</h2>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="font-semibold mb-2">3.1. Dados de Conta</h3>
                                                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                                                    <li>Nome e email</li>
                                                    <li>Senha (criptografada)</li>
                                                    <li>Foto de perfil (opcional)</li>
                                                    <li>Data de criação da conta</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h3 className="font-semibold mb-2">3.2. Dados de Uso</h3>
                                                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                                                    <li>Tarefas, eventos e metas criadas</li>
                                                    <li>Transações financeiras registradas</li>
                                                    <li>Entradas de diário</li>
                                                    <li>Dados do ciclo menstrual (se aplicável)</li>
                                                    <li>Preferências e configurações</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h3 className="font-semibold mb-2">3.3. Dados Técnicos</h3>
                                                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                                                    <li>Endereço IP (anonimizado)</li>
                                                    <li>Tipo e versão do navegador</li>
                                                    <li>Sistema operacional</li>
                                                    <li>Páginas visitadas e tempo de permanência</li>
                                                    <li>Cookies (conforme sua preferência)</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </section>

                                    <Separator />

                                    {/* How We Use Data */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Eye className="h-5 w-5 text-primary" />
                                            <h2 className="text-2xl font-semibold">4. Como Usamos Seus Dados</h2>
                                        </div>
                                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                                            <li>
                                                <strong>Fornecer o serviço:</strong> Processar suas tarefas, eventos, finanças e outros dados
                                            </li>
                                            <li>
                                                <strong>Melhorar a experiência:</strong> Personalizar o conteúdo e funcionalidades
                                            </li>
                                            <li>
                                                <strong>Comunicação:</strong> Enviar notificações importantes sobre o serviço
                                            </li>
                                            <li>
                                                <strong>Segurança:</strong> Detectar e prevenir fraudes e abusos
                                            </li>
                                            <li>
                                                <strong>Análise:</strong> Entender como o serviço é usado (apenas com seu consentimento)
                                            </li>
                                            <li>
                                                <strong>Conformidade legal:</strong> Cumprir obrigações legais
                                            </li>
                                        </ul>
                                    </section>

                                    <Separator />

                                    {/* Legal Basis */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">5. Base Legal (GDPR/LGPD)</h2>
                                        <div className="space-y-3">
                                            <div className="p-3 bg-muted rounded-lg">
                                                <strong>Execução de contrato:</strong>
                                                <p className="text-sm text-muted-foreground">
                                                    Processamento necessário para fornecer o serviço que você solicitou
                                                </p>
                                            </div>
                                            <div className="p-3 bg-muted rounded-lg">
                                                <strong>Consentimento:</strong>
                                                <p className="text-sm text-muted-foreground">
                                                    Para cookies não essenciais, marketing e análises
                                                </p>
                                            </div>
                                            <div className="p-3 bg-muted rounded-lg">
                                                <strong>Interesse legítimo:</strong>
                                                <p className="text-sm text-muted-foreground">
                                                    Para melhorar o serviço, segurança e prevenção de fraudes
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    <Separator />

                                    {/* Data Sharing */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">6. Compartilhamento de Dados</h2>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            Não vendemos seus dados pessoais. Podemos compartilhar dados apenas com:
                                        </p>
                                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                                            <li>
                                                <strong>Provedores de serviços:</strong> Hospedagem, banco de dados, análise (com contratos de proteção)
                                            </li>
                                            <li>
                                                <strong>Integrações autorizadas:</strong> Google Calendar (apenas se você conectar)
                                            </li>
                                            <li>
                                                <strong>Autoridades legais:</strong> Quando exigido por lei
                                            </li>
                                        </ul>
                                    </section>

                                    <Separator />

                                    {/* Your Rights */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Shield className="h-5 w-5 text-primary" />
                                            <h2 className="text-2xl font-semibold">7. Seus Direitos (GDPR/LGPD)</h2>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="p-4 border-l-4 border-primary bg-muted/50">
                                                <h3 className="font-semibold mb-1">✓ Direito de Acesso</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Você pode solicitar uma cópia de todos os seus dados pessoais
                                                </p>
                                            </div>
                                            <div className="p-4 border-l-4 border-primary bg-muted/50">
                                                <h3 className="font-semibold mb-1">✓ Direito de Retificação</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Você pode corrigir dados incorretos ou incompletos
                                                </p>
                                            </div>
                                            <div className="p-4 border-l-4 border-primary bg-muted/50">
                                                <h3 className="font-semibold mb-1">✓ Direito ao Esquecimento</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Você pode solicitar a exclusão permanente de sua conta e dados
                                                </p>
                                            </div>
                                            <div className="p-4 border-l-4 border-primary bg-muted/50">
                                                <h3 className="font-semibold mb-1">✓ Direito à Portabilidade</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Você pode exportar seus dados em formato legível por máquina
                                                </p>
                                            </div>
                                            <div className="p-4 border-l-4 border-primary bg-muted/50">
                                                <h3 className="font-semibold mb-1">✓ Direito de Oposição</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Você pode se opor ao processamento de seus dados em certas circunstâncias
                                                </p>
                                            </div>
                                        </div>
                                        <p className="mt-4 text-sm text-muted-foreground">
                                            Para exercer estes direitos, acesse as configurações da sua conta ou entre em contato conosco.
                                        </p>
                                    </section>

                                    <Separator />

                                    {/* Data Security */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">8. Segurança dos Dados</h2>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            Implementamos medidas de segurança adequadas para proteger seus dados:
                                        </p>
                                        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                                            <li>Criptografia SSL/TLS para transmissão de dados</li>
                                            <li>Senhas criptografadas com bcrypt</li>
                                            <li>Acesso restrito aos dados apenas para pessoal autorizado</li>
                                            <li>Backups regulares e seguros</li>
                                            <li>Monitoramento de segurança contínuo</li>
                                        </ul>
                                    </section>

                                    <Separator />

                                    {/* Data Retention */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">9. Retenção de Dados</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Mantemos seus dados pessoais apenas pelo tempo necessário para os fins descritos nesta política.
                                            Quando você exclui sua conta, todos os seus dados são permanentemente apagados dentro de 30 dias,
                                            exceto quando a retenção é exigida por lei.
                                        </p>
                                    </section>

                                    <Separator />

                                    {/* Cookies */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">10. Cookies</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Usamos cookies essenciais para o funcionamento do site e cookies opcionais (apenas com seu consentimento)
                                            para análise e marketing. Você pode gerenciar suas preferências de cookies a qualquer momento nas
                                            configurações. Para mais detalhes, consulte nossa{' '}
                                            <a href="/cookie-policy" className="text-primary hover:underline">
                                                Política de Cookies
                                            </a>
                                            .
                                        </p>
                                    </section>

                                    <Separator />

                                    {/* International Transfers */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">11. Transferências Internacionais</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Seus dados podem ser transferidos e processados em servidores localizados fora do seu país de residência.
                                            Garantimos que todas as transferências sejam feitas com salvaguardas apropriadas conforme GDPR/LGPD.
                                        </p>
                                    </section>

                                    <Separator />

                                    {/* Children's Privacy */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">12. Privacidade de Menores</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Nosso serviço não é destinado a menores de 16 anos. Não coletamos intencionalmente dados de crianças.
                                            Se você é pai/mãe ou responsável e acredita que seu filho nos forneceu dados, entre em contato conosco.
                                        </p>
                                    </section>

                                    <Separator />

                                    {/* Changes */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">13. Alterações nesta Política</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Podemos atualizar esta política periodicamente. Notificaremos você sobre mudanças significativas
                                            por email ou através de um aviso no serviço. Recomendamos revisar esta política regularmente.
                                        </p>
                                    </section>

                                    <Separator />

                                    {/* Contact */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Mail className="h-5 w-5 text-primary" />
                                            <h2 className="text-2xl font-semibold">14. Contato</h2>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            Para questões sobre esta política de privacidade ou para exercer seus direitos:
                                        </p>
                                        <div className="p-4 bg-primary/10 rounded-lg space-y-2">
                                            <p>
                                                <strong>Email:</strong> privacy@organiza-te360.com
                                            </p>
                                            <p>
                                                <strong>Encarregado de Proteção de Dados (DPO):</strong> dpo@organiza-te360.com
                                            </p>
                                        </div>
                                    </section>

                                    <Separator />

                                    {/* Supervisory Authority */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">15. Autoridade de Fiscalização</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Você tem o direito de apresentar uma reclamação a uma autoridade de proteção de dados:
                                        </p>
                                        <div className="mt-4 space-y-3">
                                            <div className="p-3 bg-muted rounded-lg">
                                                <strong>União Europeia:</strong>
                                                <p className="text-sm text-muted-foreground">
                                                    Autoridade de proteção de dados do seu país
                                                </p>
                                            </div>
                                            <div className="p-3 bg-muted rounded-lg">
                                                <strong>Brasil:</strong>
                                                <p className="text-sm text-muted-foreground">
                                                    ANPD - Autoridade Nacional de Proteção de Dados
                                                </p>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <div className="text-center text-sm text-muted-foreground">
                        <p>
                            Esta política está em conformidade com a GDPR (EU) e LGPD (Brasil)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
