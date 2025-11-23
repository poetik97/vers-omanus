import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, Scale, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function TermsOfService() {
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
                                <FileText className="h-10 w-10 text-primary" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold">Termos de Serviço</h1>
                        <p className="text-muted-foreground">
                            Última atualização: {lastUpdated}
                        </p>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <ScrollArea className="h-[600px] pr-4">
                                <div className="space-y-8">
                                    {/* Introduction */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Ao acessar e usar o Organiza-te360 ("Serviço"), você concorda em cumprir e estar vinculado a
                                            estes Termos de Serviço. Se você não concordar com alguma parte destes termos, não poderá
                                            usar o Serviço.
                                        </p>
                                    </section>

                                    <Separator />

                                    {/* Service Description */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            O Organiza-te360 é uma plataforma de organização pessoal que oferece:
                                        </p>
                                        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                                            <li>Gestão de tarefas e projetos</li>
                                            <li>Calendário e agendamento</li>
                                            <li>Controle financeiro pessoal</li>
                                            <li>Definição e acompanhamento de metas</li>
                                            <li>Diário pessoal</li>
                                            <li>Acompanhamento de ciclo menstrual</li>
                                            <li>Assistente virtual com IA</li>
                                        </ul>
                                    </section>

                                    <Separator />

                                    {/* User Accounts */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">3. Contas de Usuário</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="font-semibold mb-2">3.1. Criação de Conta</h3>
                                                <p className="text-muted-foreground leading-relaxed">
                                                    Para usar o Serviço, você deve criar uma conta fornecendo informações precisas e completas.
                                                    Você é responsável por manter a confidencialidade de sua senha e por todas as atividades
                                                    que ocorrem em sua conta.
                                                </p>
                                            </div>

                                            <div>
                                                <h3 className="font-semibold mb-2">3.2. Requisitos</h3>
                                                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                                                    <li>Você deve ter pelo menos 16 anos de idade</li>
                                                    <li>Você deve fornecer informações verdadeiras e atualizadas</li>
                                                    <li>Você não pode criar múltiplas contas para fins abusivos</li>
                                                    <li>Você deve notificar-nos imediatamente sobre qualquer uso não autorizado</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <h3 className="font-semibold mb-2">3.3. Suspensão e Encerramento</h3>
                                                <p className="text-muted-foreground leading-relaxed">
                                                    Reservamo-nos o direito de suspender ou encerrar sua conta se você violar estes termos
                                                    ou se envolver em atividades ilegais ou prejudiciais.
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    <Separator />

                                    {/* Acceptable Use */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">4. Uso Aceitável</h2>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            Você concorda em NÃO usar o Serviço para:
                                        </p>
                                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                                            <li>Violar qualquer lei local, nacional ou internacional</li>
                                            <li>Transmitir material ilegal, ofensivo ou prejudicial</li>
                                            <li>Realizar ataques de segurança ou tentativas de invasão</li>
                                            <li>Fazer engenharia reversa ou tentar acessar código-fonte</li>
                                            <li>Usar automação ou bots sem autorização expressa</li>
                                            <li>Coletar dados de outros usuários sem consentimento</li>
                                            <li>Interferir no funcionamento adequado do Serviço</li>
                                            <li>Transmitir vírus, malware ou código malicioso</li>
                                        </ul>
                                    </section>

                                    <Separator />

                                    {/* User Content */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">5. Conteúdo do Usuário</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="font-semibold mb-2">5.1. Propriedade</h3>
                                                <p className="text-muted-foreground leading-relaxed">
                                                    Você mantém todos os direitos sobre o conteúdo que cria e armazena no Serviço
                                                    (tarefas, eventos, diário, etc.). Nós não reivindicamos propriedade sobre seu conteúdo.
                                                </p>
                                            </div>

                                            <div>
                                                <h3 className="font-semibold mb-2">5.2. Licença Limitada</h3>
                                                <p className="text-muted-foreground leading-relaxed">
                                                    Ao usar o Serviço, você nos concede uma licença limitada para armazenar, processar e
                                                    exibir seu conteúdo exclusivamente para fornecer o Serviço a você.
                                                </p>
                                            </div>

                                            <div>
                                                <h3 className="font-semibold mb-2">5.3. Responsabilidade</h3>
                                                <p className="text-muted-foreground leading-relaxed">
                                                    Você é o único responsável pelo conteúdo que cria. Não somos responsáveis por revisar
                                                    ou moderar o conteúdo do usuário.
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    <Separator />

                                    {/* Intellectual Property */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">6. Propriedade Intelectual</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            O Serviço e seu conteúdo original (excluindo conteúdo do usuário), recursos e funcionalidades
                                            são e permanecerão propriedade exclusiva do Organiza-te360. O Serviço é protegido por direitos
                                            autorais, marcas registradas e outras leis.
                                        </p>
                                    </section>

                                    <Separator />

                                    {/* Privacy */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">7. Privacidade e Proteção de Dados</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Sua privacidade é importante para nós. O uso do Serviço também é regido por nossa{' '}
                                            <a href="/privacy-policy" className="text-primary hover:underline font-semibold">
                                                Política de Privacidade
                                            </a>
                                            , que está em conformidade com GDPR (UE) e LGPD (Brasil).
                                        </p>
                                    </section>

                                    <Separator />

                                    {/* Payment and Subscriptions */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">8. Pagamentos e Assinaturas</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="font-semibold mb-2">8.1. Plano Gratuito</h3>
                                                <p className="text-muted-foreground leading-relaxed">
                                                    Oferecemos um plano gratuito com recursos básicos. Recursos premium podem requerer
                                                    assinatura paga.
                                                </p>
                                            </div>

                                            <div>
                                                <h3 className="font-semibold mb-2">8.2. Assinaturas Premium</h3>
                                                <p className="text-muted-foreground leading-relaxed">
                                                    Assinaturas são cobradas antecipadamente e renovadas automaticamente. Você pode
                                                    cancelar a qualquer momento através das configurações da conta.
                                                </p>
                                            </div>

                                            <div>
                                                <h3 className="font-semibold mb-2">8.3. Reembolsos</h3>
                                                <p className="text-muted-foreground leading-relaxed">
                                                    Reembolsos são tratados caso a caso. Entre em contato conosco para resolver qualquer
                                                    problema de cobrança.
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    <Separator />

                                    {/* Disclaimers */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">9. Isenções de Responsabilidade</h2>
                                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                            <p className="text-muted-foreground leading-relaxed mb-2">
                                                <strong>O SERVIÇO É FORNECIDO "COMO ESTÁ" E "CONFORME DISPONÍVEL".</strong>
                                            </p>
                                            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 text-sm">
                                                <li>Não garantimos que o Serviço será ininterrupto ou livre de erros</li>
                                                <li>Não somos responsáveis por perda de dados (faça backups!)</li>
                                                <li>O assistente de IA fornece sugestões, não aconselhamento profissional</li>
                                                <li>Informações de saúde (ciclo menstrual) são apenas para rastreamento pessoal</li>
                                            </ul>
                                        </div>
                                    </section>

                                    <Separator />

                                    {/* Limitation of Liability */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Scale className="h-5 w-5 text-primary" />
                                            <h2 className="text-2xl font-semibold">10. Limitação de Responsabilidade</h2>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed">
                                            EM NENHUMA CIRCUNSTÂNCIA o Organiza-te360, seus diretores, funcionários ou parceiros serão
                                            responsáveis por danos indiretos, incidentais, especiais, consequenciais ou punitivos,
                                            incluindo perda de lucros, dados, uso ou outros danos intangíveis resultantes de:
                                        </p>
                                        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-3">
                                            <li>Seu acesso ou uso (ou incapacidade de acesso) do Serviço</li>
                                            <li>Qualquer conduta ou conteúdo de terceiros</li>
                                            <li>Acesso não autorizado às suas transmissões ou conteúdo</li>
                                        </ul>
                                    </section>

                                    <Separator />

                                    {/* Indemnification */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">11. Indenização</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Você concorda em defender, indenizar e isentar o Organiza-te360 de qualquer reivindicação,
                                            dano, obrigação, perda, responsabilidade, custo ou dívida, e despesas decorrentes de:
                                        </p>
                                        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-3">
                                            <li>Seu uso e acesso do Serviço</li>
                                            <li>Sua violação destes Termos</li>
                                            <li>Sua violação de direitos de terceiros</li>
                                        </ul>
                                    </section>

                                    <Separator />

                                    {/* Modifications */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">12. Modificações do Serviço e Termos</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Reservamo-nos o direito de modificar ou descontinuar o Serviço a qualquer momento.
                                            Também podemos revisar estes Termos periodicamente. Notificaremos você sobre mudanças
                                            significativas. Seu uso continuado após as alterações constitui aceitação dos novos termos.
                                        </p>
                                    </section>

                                    <Separator />

                                    {/* Governing Law */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">13. Lei Aplicável</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Estes Termos serão regidos e interpretados de acordo com as leis da União Europeia
                                            (GDPR) e do Brasil (LGPD), conforme aplicável à sua localização.
                                        </p>
                                    </section>

                                    <Separator />

                                    {/* Dispute Resolution */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">14. Resolução de Disputas</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Qualquer disputa relacionada a estes Termos será resolvida primeiro através de negociação
                                            de boa-fé. Se não for possível resolver amigavelmente, a disputa será submetida à
                                            arbitragem ou ao tribunal competente de sua jurisdição.
                                        </p>
                                    </section>

                                    <Separator />

                                    {/* Severability */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">15. Divisibilidade</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Se qualquer disposição destes Termos for considerada inválida ou inexequível, as
                                            disposições restantes continuarão em pleno vigor e efeito.
                                        </p>
                                    </section>

                                    <Separator />

                                    {/* Entire Agreement */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">16. Acordo Completo</h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Estes Termos, juntamente com nossa Política de Privacidade, constituem o acordo completo
                                            entre você e o Organiza-te360 em relação ao uso do Serviço.
                                        </p>
                                    </section>

                                    <Separator />

                                    {/* Contact */}
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-4">17. Contato</h2>
                                        <p className="text-muted-foreground leading-relaxed mb-4">
                                            Para questões sobre estes Termos de Serviço:
                                        </p>
                                        <div className="p-4 bg-primary/10 rounded-lg">
                                            <p>
                                                <strong>Email:</strong> legal@organiza-te360.com
                                            </p>
                                        </div>
                                    </section>
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <div className="text-center text-sm text-muted-foreground">
                        <p>
                            Ao usar o Organiza-te360, você concorda com estes Termos de Serviço
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
