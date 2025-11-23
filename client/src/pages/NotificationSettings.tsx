import { useState } from 'react';
import { Bell, Settings, Clock, Mail, ToggleLeft, ToggleRight, Save, RefreshCw, Send, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { trpc } from '../lib/trpc';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';

export default function NotificationSettings() {
    const [timeValue, setTimeValue] = useState('');

    // Queries
    const { data: prefs, isLoading } = trpc.notificationPreferences.get.useQuery();

    // Mutations
    const updateMutation = trpc.notificationPreferences.update.useMutation({
        onSuccess: () => {
            toast.success('Preferências atualizadas com sucesso!');
        },
        onError: () => {
            toast.error('Erro ao atualizar preferências');
        },
    });

    const resetMutation = trpc.notificationPreferences.resetToDefaults.useMutation({
        onSuccess: () => {
            toast.success('Preferências restauradas para padrão!');
        },
    });

    const testEmailMutation = trpc.notificationPreferences.sendTestEmail.useMutation({
        onSuccess: (data) => {
            toast.success(data.message);
        },
        onError: (error) => {
            toast.error(error.message || 'Erro ao enviar email de teste');
        },
    });

    const handleToggle = (key: string, value: boolean) => {
        updateMutation.mutate({ [key]: value } as any);
    };

    const handleTimeChange = (key: string, value: string) => {
        updateMutation.mutate({ [key]: value } as any);
    };

    const handleReset = () => {
        if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
            resetMutation.mutate();
        }
    };

    const handleTestEmail = () => {
        testEmailMutation.mutate();
    };

    if (isLoading) {
        return (
            <div className="container max-w-4xl mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/settings">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Configurações de Notificações</h1>
                        <p className="text-muted-foreground mt-1">
                            Personalize como e quando recebes notificações
                        </p>
                    </div>
                </div>
                <Button variant="outline" onClick={handleReset} disabled={resetMutation.isPending}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restaurar Padrões
                </Button>
            </div>

            {/* Canais de Notificação */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Canais de Notificação
                    </CardTitle>
                    <CardDescription>
                        Escolhe como queres receber as notificações
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="email-enabled">Email</Label>
                            <p className="text-sm text-muted-foreground">
                                Receber notificações por email
                            </p>
                        </div>
                        <Switch
                            id="email-enabled"
                            checked={prefs?.emailEnabled ?? true}
                            onCheckedChange={(checked) => handleToggle('emailEnabled', checked)}
                            disabled={updateMutation.isPending}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="push-enabled">Notificações Push</Label>
                            <p className="text-sm text-muted-foreground">
                                Notificações no navegador
                            </p>
                        </div>
                        <Switch
                            id="push-enabled"
                            checked={prefs?.pushEnabled ?? true}
                            onCheckedChange={(checked) => handleToggle('pushEnabled', checked)}
                            disabled={updateMutation.isPending}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Tipos de Notificações */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Tipos de Notificações
                    </CardTitle>
                    <CardDescription>
                        Ativa ou desativa tipos específicos de notificações
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <NotificationToggle
                        id="task-reminders"
                        icon="📋"
                        label="Lembretes de Tarefas"
                        description="Notificações sobre tarefas próximas do prazo"
                        checked={prefs?.taskReminders ?? true}
                        onChange={(checked) => handleToggle('taskReminders', checked)}
                        disabled={updateMutation.isPending}
                    />

                    <NotificationToggle
                        id="event-reminders"
                        icon="📅"
                        label="Lembretes de Eventos"
                        description="Alertas sobre eventos próximos"
                        checked={prefs?.eventReminders ?? true}
                        onChange={(checked) => handleToggle('eventReminders', checked)}
                        disabled={updateMutation.isPending}
                    />

                    <NotificationToggle
                        id="goal-updates"
                        icon="🎯"
                        label="Progresso de Objetivos"
                        description="Atualizações sobre o progresso dos teus objetivos"
                        checked={prefs?.goalUpdates ?? true}
                        onChange={(checked) => handleToggle('goalUpdates', checked)}
                        disabled={updateMutation.isPending}
                    />

                    <NotificationToggle
                        id="financial-alerts"
                        icon="💰"
                        label="Alertas Financeiros"
                        description="Notificações sobre orçamento e despesas"
                        checked={prefs?.financialAlerts ?? true}
                        onChange={(checked) => handleToggle('financialAlerts', checked)}
                        disabled={updateMutation.isPending}
                    />

                    <NotificationToggle
                        id="diary-reminders"
                        icon="📖"
                        label="Lembretes de Diário"
                        description="Lembrete diário para escrever no diário"
                        checked={prefs?.diaryReminders ?? true}
                        onChange={(checked) => handleToggle('diaryReminders', checked)}
                        disabled={updateMutation.isPending}
                    />

                    <NotificationToggle
                        id="menstrual-alerts"
                        icon="🔄"
                        label="Alertas de Ciclo Menstrual"
                        description="Previsões e alertas do ciclo menstrual"
                        checked={prefs?.menstrualAlerts ?? true}
                        onChange={(checked) => handleToggle('menstrualAlerts', checked)}
                        disabled={updateMutation.isPending}
                    />
                </CardContent>
            </Card>

            {/* Resumos Automáticos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Resumos Automáticos
                    </CardTitle>
                    <CardDescription>
                        Recebe resumos periódicos das tuas atividades
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="daily-summary">Resumo Diário</Label>
                                <p className="text-sm text-muted-foreground">
                                    Email com resumo das tarefas e eventos do dia
                                </p>
                            </div>
                            <Switch
                                id="daily-summary"
                                checked={prefs?.dailySummary ?? true}
                                onCheckedChange={(checked) => handleToggle('dailySummary', checked)}
                                disabled={updateMutation.isPending}
                            />
                        </div>

                        {prefs?.dailySummary && (
                            <div className="ml-4 space-y-2">
                                <Label htmlFor="daily-time">Horário</Label>
                                <Input
                                    id="daily-time"
                                    type="time"
                                    value={prefs?.dailySummaryTime || '08:00'}
                                    onChange={(e) => handleTimeChange('dailySummaryTime', e.target.value)}
                                    className="w-40"
                                />
                            </div>
                        )}
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="weekly-summary">Resumo Semanal</Label>
                            <p className="text-sm text-muted-foreground">
                                Relatório semanal completo (domingos às 20h)
                            </p>
                        </div>
                        <Switch
                            id="weekly-summary"
                            checked={prefs?.weeklySummary ?? true}
                            onCheckedChange={(checked) => handleToggle('weeklySummary', checked)}
                            disabled={updateMutation.isPending}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="monthly-summary">Resumo Mensal</Label>
                            <p className="text-sm text-muted-foreground">
                                Relatório mensal (primeiro dia do mês)
                            </p>
                        </div>
                        <Switch
                            id="monthly-summary"
                            checked={prefs?.monthlySummary ?? false}
                            onCheckedChange={(checked) => handleToggle('monthlySummary', checked)}
                            disabled={updateMutation.isPending}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Modo Não Incomodar */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Horário de Silêncio
                    </CardTitle>
                    <CardDescription>
                        Define um período em que não queres receber notificações
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="quiet-start">Início</Label>
                            <Input
                                id="quiet-start"
                                type="time"
                                value={prefs?.quietHoursStart || ''}
                                onChange={(e) => handleTimeChange('quietHoursStart', e.target.value || '')}
                                placeholder="22:00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quiet-end">Fim</Label>
                            <Input
                                id="quiet-end"
                                type="time"
                                value={prefs?.quietHoursEnd || ''}
                                onChange={(e) => handleTimeChange('quietHoursEnd', e.target.value || '')}
                                placeholder="08:00"
                            />
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        ℹ️ Durante este período, as notificações serão silenciadas (exceto alertas urgentes)
                    </p>
                </CardContent>
            </Card>

            {/* Test Email */}
            <Card>
                <CardHeader>
                    <CardTitle>Testar Configurações</CardTitle>
                    <CardDescription>
                        Envia um email de teste para verificar se tudo está a funcionar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={handleTestEmail}
                        disabled={testEmailMutation.isPending || !prefs?.emailEnabled}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        {testEmailMutation.isPending ? 'Enviando...' : 'Enviar Email de Teste'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

// Helper component for notification toggles
function NotificationToggle({
    id,
    icon,
    label,
    description,
    checked,
    onChange,
    disabled,
}: {
    id: string;
    icon: string;
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <div className="space-y-0.5">
                        <Label htmlFor={id}>{label}</Label>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                </div>
                <Switch
                    id={id}
                    checked={checked}
                    onCheckedChange={onChange}
                    disabled={disabled}
                />
            </div>
            <Separator />
        </>
    );
}
