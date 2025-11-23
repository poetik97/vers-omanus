import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, ChevronRight, LayoutDashboard, Sparkles, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingTourProps {
    onComplete: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
    const [step, setStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const completeOnboarding = trpc.users.completeOnboarding.useMutation();

    const steps = [
        {
            title: "Bem-vindo ao Organiza-te360!",
            description: "A tua plataforma completa para organizar a vida, finanças e objetivos num só lugar.",
            icon: <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl">👋</div>,
            target: "center"
        },
        {
            title: "Navegação Simples",
            description: "Usa o menu lateral para acederes rapidamente às tuas Tarefas, Calendário, Finanças e muito mais.",
            icon: <Menu className="w-12 h-12 text-purple-500" />,
            target: "sidebar"
        },
        {
            title: "Assistente IA Inteligente",
            description: "O teu assistente pessoal ajuda-te a analisar dados, sugerir melhorias e manter o foco.",
            icon: <Sparkles className="w-12 h-12 text-yellow-500" />,
            target: "ai-chat"
        },
        {
            title: "Tudo Pronto!",
            description: "Configura o teu perfil e começa a organizar a tua vida hoje mesmo.",
            icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
            target: "center"
        }
    ];

    const handleNext = async () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            // Skip server call - will be saved when user logs in
            // await completeOnboarding.mutateAsync();
            setIsVisible(false);
            onComplete();
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
            <Card className="w-full max-w-md mx-4 border-primary/20 shadow-2xl relative overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 pointer-events-none" />

                <CardHeader className="text-center pt-8 pb-2 relative z-10">
                    <div className="flex justify-center mb-4">
                        {steps[step].icon}
                    </div>
                    <CardTitle className="text-2xl font-bold gradient-text">
                        {steps[step].title}
                    </CardTitle>
                </CardHeader>

                <CardContent className="text-center text-muted-foreground relative z-10 min-h-[80px]">
                    {steps[step].description}
                </CardContent>

                <CardFooter className="flex justify-between items-center relative z-10 pt-4">
                    <div className="flex gap-1">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all duration-300",
                                    i === step ? "bg-primary w-6" : "bg-muted"
                                )}
                            />
                        ))}
                    </div>

                    <Button onClick={handleNext} className="gap-2">
                        {step === steps.length - 1 ? "Começar" : "Próximo"}
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
