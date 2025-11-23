import React, { useEffect, useState, useRef } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import {
  Calendar,
  CheckSquare,
  Target,
  Wallet,
  BookOpen,
  Sparkles,
  ArrowRight,
  BarChart3,
  Zap,
  Shield,
  Star,
  Heart,
  TrendingUp,
  Users,
  Award,
  Clock,
  Check,
  Brain,
  LineChart,
  Bell,
  Lock
} from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function Home() {
  const { user, signOut } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Contador animado
  const AnimatedCounter = ({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) => {
    const [count, setCount] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
            const startTime = Date.now();
            const timer = setInterval(() => {
              const now = Date.now();
              const progress = Math.min((now - startTime) / duration, 1);
              setCount(Math.floor(progress * end));
              if (progress === 1) clearInterval(timer);
            }, 16);
          }
        },
        { threshold: 0.5 }
      );

      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, [end, duration, hasStarted]);

    return <span ref={ref}>{count}{suffix}</span>;
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header Clean */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              {APP_LOGO && (
                <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
              )}
              <h1 className="text-xl font-bold text-gray-900">
                {APP_TITLE}
              </h1>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              {['Funcionalidades', 'Preços', 'Sobre'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated && user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => signOut()}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                      Entrar
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                      Começar Grátis
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Clean & White */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 border border-purple-100 mb-6">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  Plataforma #1 de Organização com IA
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Organize a sua vida com{" "}
                <span className="text-purple-600">Inteligência Artificial</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                A plataforma mais avançada da Europa para gerir tarefas, calendário, finanças e objetivos.
                Potencializada por IA para maximizar a sua produtividade.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/login">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-6"
                  >
                    Começar Gratuitamente
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 text-lg px-8 py-6"
                >
                  Ver Demonstração
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Grátis para sempre</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Configuração em 2 minutos</span>
                </div>
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/images/landing/hero-woman-laptop.jpg"
                  alt="Pessoa a usar o Organiza-te360"
                  className="w-full h-auto"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">5 tarefas concluídas</div>
                    <div className="text-xs text-gray-600">Hoje às 14:30</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: 50000, suffix: "+", label: "Utilizadores Ativos" },
              { value: 98, suffix: "%", label: "Taxa de Satisfação" },
              { value: 1000000, suffix: "+", label: "Tarefas Concluídas" },
              { value: 24, suffix: "/7", label: "Suporte Disponível" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-20 px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tudo o que precisa, <span className="text-purple-600">num só lugar</span>
            </h2>
            <p className="text-xl text-gray-600">
              Uma plataforma completa para organizar todos os aspetos da sua vida pessoal e profissional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: CheckSquare,
                title: "Gestão de Tarefas",
                description: "Organize tarefas com prioridades, etiquetas e prazos. Arraste e solte para reorganizar facilmente.",
                image: "/images/landing/minimal-desk.jpg"
              },
              {
                icon: Calendar,
                title: "Calendário Inteligente",
                description: "Sincronize com Google Calendar. Visualize eventos e tarefas numa única linha temporal.",
                image: "/images/landing/team-collaboration.jpg"
              },
              {
                icon: Wallet,
                title: "Controlo Financeiro",
                description: "Acompanhe receitas, despesas e objetivos financeiros. Análises automáticas com IA.",
                image: "/images/landing/clean-workspace.jpg"
              },
              {
                icon: Target,
                title: "Objetivos",
                description: "Defina e acompanhe objetivos com metodologia SMART. Progresso visual e motivacional.",
                image: "/images/landing/woman-coffee-laptop.jpg"
              },
              {
                icon: Brain,
                title: "Assistente IA",
                description: "Chat inteligente que sugere tarefas, analisa padrões e oferece insights personalizados.",
                image: "/images/landing/hero-woman-laptop.jpg"
              },
              {
                icon: BookOpen,
                title: "Diário Pessoal",
                description: "Registe pensamentos e reflexões. Análise de sentimento automática para acompanhar o bem-estar.",
                image: "/images/landing/minimal-desk.jpg"
              }
            ].map((feature, index) => (
              <div key={index} className="group">
                <div className="rounded-xl overflow-hidden mb-4 shadow-md group-hover:shadow-xl transition-shadow">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Porque escolher o <span className="text-purple-600">Organiza-te360</span>?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                title: "Rápido e Intuitivo",
                description: "Interface limpa e fácil de usar. Comece a organizar em segundos."
              },
              {
                icon: Shield,
                title: "Seguro e Privado",
                description: "Dados encriptados e protegidos. Conformidade total com RGPD."
              },
              {
                icon: LineChart,
                title: "Insights Inteligentes",
                description: "IA analisa padrões e sugere melhorias para aumentar produtividade."
              },
              {
                icon: Users,
                title: "Suporte Dedicado",
                description: "Equipa disponível 24/7 para ajudar no que precisar."
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que dizem os nossos utilizadores
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Ana Silva",
                role: "Gestora de Projetos",
                avatar: "👩‍💼",
                rating: 5,
                text: "Transformou completamente a minha produtividade. Consigo gerir projetos complexos com facilidade e nunca mais perdi um prazo."
              },
              {
                name: "João Santos",
                role: "Empreendedor",
                avatar: "👨‍💻",
                rating: 5,
                text: "A integração com Google Calendar e o assistente IA são incríveis. Poupa-me horas todas as semanas na organização."
              },
              {
                name: "Maria Costa",
                role: "Designer",
                avatar: "👩‍🎨",
                rating: 5,
                text: "Interface linda e funcional. O controlo financeiro ajudou-me a poupar 30% mais do que antes. Recomendo!"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="preços" className="py-20 px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Escolha o plano <span className="text-purple-600">perfeito</span> para si
            </h2>
            <p className="text-xl text-gray-600">
              Comece grátis. Faça upgrade quando precisar de mais funcionalidades.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Grátis",
                price: "€0",
                period: "/mês",
                description: "Perfeito para começar",
                features: [
                  "Até 50 tarefas",
                  "Calendário básico",
                  "Controlo financeiro",
                  "1 objetivo ativo",
                  "Suporte por email"
                ],
                cta: "Começar Grátis",
                highlighted: false
              },
              {
                name: "Pro",
                price: "€9,99",
                period: "/mês",
                description: "Para profissionais exigentes",
                features: [
                  "Tarefas ilimitadas",
                  "Calendário avançado",
                  "Análise financeira IA",
                  "Objetivos ilimitados",
                  "Assistente IA completo",
                  "Suporte prioritário",
                  "Sincronização Google"
                ],
                cta: "Começar Teste Grátis",
                highlighted: true,
                badge: "Mais Popular"
              },
              {
                name: "Enterprise",
                price: "€29,99",
                period: "/mês",
                description: "Para equipas e empresas",
                features: [
                  "Tudo do plano Pro",
                  "Colaboração em equipa",
                  "Relatórios avançados",
                  "API personalizada",
                  "Gestor de conta dedicado",
                  "SLA garantido",
                  "Formação incluída"
                ],
                cta: "Contactar Vendas",
                highlighted: false
              }
            ].map((plan, index) => (
              <div
                key={index}
                className={cn(
                  "bg-white rounded-2xl p-8 shadow-md border",
                  plan.highlighted
                    ? "border-purple-200 shadow-xl scale-105 relative"
                    : "border-gray-200"
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </div>

                <Link href="/login">
                  <Button
                    className={cn(
                      "w-full mb-6",
                      plan.highlighted
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                    )}
                  >
                    {plan.cta}
                  </Button>
                </Link>

                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-center text-white">
            <Sparkles className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">
              Pronto para transformar a sua vida?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Junte-se a milhares de utilizadores que já organizam a sua vida com inteligência artificial
            </p>
            <Link href="/login">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6"
              >
                Começar Gratuitamente
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <div className="flex items-center justify-center gap-8 mt-8 text-sm opacity-90">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Dados Protegidos (RGPD)</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span>4.9/5 em 2.000+ avaliações</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>50.000+ utilizadores</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="sobre" className="bg-gray-900 text-gray-300 py-12 px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                {APP_LOGO && (
                  <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
                )}
                <h3 className="text-xl font-bold text-white">{APP_TITLE}</h3>
              </div>
              <p className="text-sm text-gray-400">
                A plataforma que resolve todos os seus problemas.
              </p>
            </div>

            {/* Produto */}
            <div>
              <h4 className="font-semibold text-white mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#preços" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="/login" className="hover:text-white transition-colors">Começar</a></li>
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <h4 className="font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#sobre" className="hover:text-white transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos de Serviço</a></li>
                <li><a href="#" className="hover:text-white transition-colors">RGPD</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 {APP_TITLE}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

