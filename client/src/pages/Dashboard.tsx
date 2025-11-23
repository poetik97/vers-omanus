import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  CheckSquare,
  Target,
  Wallet,
  TrendingUp,
  Zap,
  Award,
  Plus,
  Sparkles,
  Flame,
  Clock,
  ArrowRight,
  TrendingDown,
  Activity,
  BarChart3,
  CheckCircle2,
  Circle
} from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { AddEventDialog } from "@/components/AddEventDialog";
import { AddGoalDialog } from "@/components/AddGoalDialog";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  // Get authenticated user
  const { user } = useSupabaseAuth();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);

  // Fetch real data from backend
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: tasksData } = trpc.tasks.list.useQuery();
  const { data: eventsData } = trpc.events.list.useQuery();
  const { data: goalsData } = trpc.goals.list.useQuery();

  const tasks = tasksData?.tasks || [];
  const events = eventsData?.events || [];
  const goals = goalsData?.goals || [];
  const { data: gamification } = trpc.gamification.profile.useQuery();
  const { data: aiSummary } = trpc.ai.dailySummary.useQuery();
  const { data: aiInsights } = trpc.ai.getInsights.useQuery();



  const todayTasks = tasks?.filter(t => {
    if (!t.dueDate) return false;
    const today = new Date().toDateString();
    return new Date(t.dueDate).toDateString() === today;
  }) || [];

  const completedTasks = tasks?.filter(t => t.status === 'completed') || [];
  const completionRate = tasks && tasks.length > 0
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  // Upcoming events (next 3)
  const upcomingEvents = events?.filter((e: any) => new Date(e.startTime) > new Date())
    .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3) || [];

  // Active goals with progress
  const activeGoals = goals?.filter((g: any) => g.status === 'active').slice(0, 3) || [];

  // Calculate streak (mock for now - should be from backend)
  const streak = 7;

  // Calculate productivity score
  const productivityScore = Math.min(100, Math.round(
    (completionRate * 0.4) +
    ((gamification?.xp || 0) / 100 * 0.3) +
    (streak * 2 * 0.3)
  ));

  return (
    <>
      <AddTaskDialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen} />
      <AddEventDialog open={eventDialogOpen} onOpenChange={setEventDialogOpen} />
      <AddGoalDialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen} />
      <AddTransactionDialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen} />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/20 dark:to-purple-950/10">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-2">
                  Olá, {user?.name?.split(' ')[0] || 'Utilizador'}! 👋
                </h2>
                <p className="text-muted-foreground">
                  {aiSummary?.summary || new Date().toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Level & Streak Badges */}
              <div className="flex gap-3">
                {/* Level Badge */}
                <div className="glass-premium rounded-2xl px-6 py-3 border-border/50 flex items-center gap-3 hover-lift">
                  <Award className="w-8 h-8 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">Nível</div>
                    <div className="text-2xl font-bold gradient-text">{gamification?.level || 1}</div>
                  </div>
                </div>

                {/* Streak Badge */}
                <div className="glass-premium rounded-2xl px-6 py-3 border-border/50 flex items-center gap-3 hover-lift">
                  <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
                  <div>
                    <div className="text-xs text-muted-foreground">Streak</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                      {streak} dias
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="max-w-md">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progresso XP</span>
                <span className="font-semibold">{gamification?.xp || 0} / {((gamification?.level || 1) * 1000)} XP</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-primary via-purple-600 to-pink-600 animate-shimmer transition-all duration-500 relative"
                  style={{ width: `${((gamification?.xp || 0) / ((gamification?.level || 1) * 1000)) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid - Real Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glass-premium hover-lift border-border/50 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tarefas Pendentes
                </CardTitle>
                <CheckSquare className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold gradient-text mb-1">
                  {isLoading ? "..." : stats?.tasksCount || 0}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {todayTasks.length} para hoje
                </p>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Taxa de conclusão</span>
                    <span className="font-semibold text-green-600">{completionRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-premium hover-lift border-border/50 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Eventos Futuros
                </CardTitle>
                <Calendar className="w-5 h-5 text-cyan-500 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold gradient-text mb-1">
                  {isLoading ? "..." : stats?.eventsCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Agendados
                </p>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="text-xs text-muted-foreground">
                    {upcomingEvents.length > 0
                      ? `Próximo: ${new Date(upcomingEvents[0].startTime).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}`
                      : 'Nenhum evento próximo'
                    }
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-premium hover-lift border-border/50 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Objetivos Ativos
                </CardTitle>
                <Target className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold gradient-text mb-1">
                  {isLoading ? "..." : stats?.goalsCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Em progresso
                </p>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progresso médio</span>
                    <span className="font-semibold text-green-600">
                      {activeGoals.length > 0
                        ? Math.round(activeGoals.reduce((acc: any, g: any) => acc + g.progress, 0) / activeGoals.length)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-premium hover-lift border-border/50 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Saldo Total
                </CardTitle>
                <Wallet className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold gradient-text mb-1">
                  {isLoading ? "..." : `€${stats?.balance.toFixed(2) || "0.00"}`}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  Atualizado agora
                </p>
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="text-xs text-muted-foreground">
                    Este mês: +€250.00
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Productivity Score & Quick Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Productivity Score Widget */}
            <Card className="glass-premium border-border/50 hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-primary" />
                  Score de Produtividade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-4">
                  {/* Circular Progress */}
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted/20"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - productivityScore / 100)}`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="rgb(168, 85, 247)" />
                          <stop offset="100%" stopColor="rgb(236, 72, 153)" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {productivityScore}
                        </div>
                        <div className="text-xs text-muted-foreground">/ 100</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Conclusão de tarefas</span>
                    <span className="font-semibold">{completionRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Streak atual</span>
                    <span className="font-semibold">{streak} dias</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">XP ganho</span>
                    <span className="font-semibold">{gamification?.xp || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="lg:col-span-2 glass-premium border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-primary" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={() => setTaskDialogOpen(true)}
                    className="h-auto py-4 bg-gradient-to-br from-primary/10 to-purple-600/10 hover:from-primary/20 hover:to-purple-600/20 border border-primary/20 text-foreground justify-start group"
                    variant="outline"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Nova Tarefa</div>
                      <div className="text-xs text-muted-foreground">Ctrl + N</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => setEventDialogOpen(true)}
                    className="h-auto py-4 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 hover:from-cyan-500/20 hover:to-blue-600/20 border border-cyan-500/20 text-foreground justify-start group"
                    variant="outline"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Novo Evento</div>
                      <div className="text-xs text-muted-foreground">Ctrl + E</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => setGoalDialogOpen(true)}
                    className="h-auto py-4 bg-gradient-to-br from-green-500/10 to-emerald-600/10 hover:from-green-500/20 hover:to-emerald-600/20 border border-green-500/20 text-foreground justify-start group"
                    variant="outline"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Novo Objetivo</div>
                      <div className="text-xs text-muted-foreground">Ctrl + G</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => setTransactionDialogOpen(true)}
                    className="h-auto py-4 bg-gradient-to-br from-orange-500/10 to-red-600/10 hover:from-orange-500/20 hover:to-red-600/20 border border-orange-500/20 text-foreground justify-start group"
                    variant="outline"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Transação</div>
                      <div className="text-xs text-muted-foreground">Ctrl + T</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Three Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Today's Tasks */}
            <Card className="glass-premium border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Tarefas de Hoje</CardTitle>
                <Link href="/tasks">
                  <Button variant="ghost" size="sm" className="text-primary">
                    Ver todas
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {todayTasks.length === 0 ? (
                  <div className="py-8 text-center">
                    <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">Nenhuma tarefa para hoje</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setTaskDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Tarefa
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayTasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg bg-gradient-to-r from-background to-muted/20 border border-border/50 hover:border-primary/30 transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform",
                            task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-muted-foreground'
                          )}>
                            {task.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={cn(
                              "font-medium text-sm",
                              task.status === 'completed' && 'line-through text-muted-foreground'
                            )}>
                              {task.title}
                            </div>
                            {task.description && (
                              <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {task.description}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                task.priority === 'high' && 'bg-red-500/10 text-red-600',
                                task.priority === 'medium' && 'bg-orange-500/10 text-orange-600',
                                task.priority === 'low' && 'bg-green-500/10 text-green-600'
                              )}>
                                {task.priority === 'high' && '🔴 Alta'}
                                {task.priority === 'medium' && '🟠 Média'}
                                {task.priority === 'low' && '🟢 Baixa'}
                              </span>
                              {task.estimatedTime && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {task.estimatedTime}min
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="glass-premium border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Próximos Eventos</CardTitle>
                <Link href="/calendar">
                  <Button variant="ghost" size="sm" className="text-cyan-500">
                    Ver calendário
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <div className="py-8 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">Nenhum evento agendado</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setEventDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Evento
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-3 rounded-lg bg-gradient-to-r from-cyan-500/5 to-blue-600/5 border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{event.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(event.startDate).toLocaleDateString('pt-PT', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            {event.location && (
                              <div className="text-xs text-muted-foreground mt-1">
                                📍 {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Goals */}
            <Card className="glass-premium border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Objetivos Ativos</CardTitle>
                <Link href="/goals">
                  <Button variant="ghost" size="sm" className="text-green-500">
                    Ver todos
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {activeGoals.length === 0 ? (
                  <div className="py-8 text-center">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">Nenhum objetivo ativo</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setGoalDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Objetivo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeGoals.map((goal) => (
                      <div
                        key={goal.id}
                        className="p-3 rounded-lg bg-gradient-to-r from-green-500/5 to-emerald-600/5 border border-green-500/20 hover:border-green-500/40 transition-all"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                            <Target className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{goal.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Meta: {new Date(goal.deadline).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-semibold text-green-600">{goal.progress}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <Card className="glass-premium border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                Insights de IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiInsights?.insights ? (
                <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                  {aiInsights.insights}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fallback/Loading state */}
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 animate-pulse h-24" />
                  <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20 animate-pulse h-24" />
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}

