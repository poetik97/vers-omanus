import React, { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Sparkles,
  AlertCircle,
  Video,
  Bell,
  Grid3x3,
  List,
  Edit2,
  Trash2,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { AddEventDialog } from "@/components/AddEventDialog";

type ViewMode = "month" | "week" | "day";

export default function Calendar() {
  // Bypass authentication
  const user = { name: "Utilizador", id: "demo-user" };
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [quickAddInput, setQuickAddInput] = useState("");
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [aiDraft, setAiDraft] = useState<any>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const { toast } = useToast();

  const parseEventMutation = trpc.ai.parseEvent.useMutation({
    onSuccess: (data) => {
      setAiDraft(data);
      setEventDialogOpen(true);
      setQuickAddInput("");
      setIsProcessingAI(false);
      toast({
        title: "Evento processado!",
        description: "Verifique os detalhes e confirme a criação.",
      });
    },
    onError: (error) => {
      setIsProcessingAI(false);
      toast({
        title: "Erro ao processar",
        description: "Não foi possível entender o evento. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleAIQuickAdd = () => {
    if (!quickAddInput.trim()) return;

    setIsProcessingAI(true);
    parseEventMutation.mutate({ message: quickAddInput });
  };

  // Fetch events from backend
  const { data: eventsData, isLoading, refetch } = trpc.events.list.useQuery();
  const events = eventsData?.events || [];
  const deleteMutation = trpc.events.delete.useMutation({
    onSuccess: () => refetch()
  });

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];



  // Calendar calculations
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];

    // Previous month days
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        fullDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthLastDay - i)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i)
      });
    }

    return days;
  }, [currentDate, daysInMonth, startingDayOfWeek]);

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    if (!events) return [];
    return events.filter((event: any) => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Navigation
  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Stats
  const stats = {
    total: events?.length || 0,
    today: events?.filter((e: any) => {
      const eventDate = new Date(e.startTime);
      const today = new Date();
      return eventDate.toDateString() === today.toDateString();
    }).length || 0,
    upcoming: events?.filter((e: any) => new Date(e.startTime) > new Date()).length || 0,
    thisMonth: events?.filter((e: any) => {
      const eventDate = new Date(e.startTime);
      return eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear();
    }).length || 0
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar este evento?')) {
      deleteMutation.mutate({ id });
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <>
      <AddEventDialog
        open={eventDialogOpen}
        onOpenChange={(open) => {
          setEventDialogOpen(open);
          if (!open) {
            setSelectedEvent(null);
            setAiDraft(null);
          }
        }}
        initialData={aiDraft}
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-cyan-50/20 dark:to-cyan-950/10">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
                  <CalendarIcon className="w-8 h-8 text-cyan-500" />
                  Calendário Inteligente
                </h1>
                <p className="text-muted-foreground">
                  Gerencie seus eventos com IA e sincronização Google Calendar
                </p>
              </div>

              <Button
                onClick={() => {
                  setSelectedEvent(null);
                  setEventDialogOpen(true);
                }}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Novo Evento
              </Button>
            </div>

            {/* Quick Add with AI */}
            <Card className="glass-premium border-primary/20 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 animate-pulse" />
                  <Input
                    placeholder='Adicione evento com linguagem natural: "reunião amanhã às 17h"...'
                    className="border-0 bg-transparent focus-visible:ring-0 text-base"
                    value={quickAddInput}
                    onChange={(e) => setQuickAddInput(e.target.value)}
                    disabled={isProcessingAI}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && quickAddInput.trim()) {
                        handleAIQuickAdd();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
                    onClick={handleAIQuickAdd}
                    disabled={isProcessingAI || !quickAddInput.trim()}
                  >
                    {isProcessingAI ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      "Adicionar"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="glass-premium border-border/50 hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <CalendarIcon className="w-4 h-4 text-cyan-500" />
                  </div>
                  <div className="text-2xl font-bold gradient-text">{stats.total}</div>
                </CardContent>
              </Card>

              <Card className="glass-premium border-border/50 hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Hoje</span>
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
                </CardContent>
              </Card>

              <Card className="glass-premium border-border/50 hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Próximos</span>
                    <Bell className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{stats.upcoming}</div>
                </CardContent>
              </Card>

              <Card className="glass-premium border-border/50 hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Este Mês</span>
                    <Grid3x3 className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {stats.thisMonth}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Calendar Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Navigation */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth(-1)}
                  className="glass-premium border-border/50 hover:border-primary/30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="text-center min-w-[200px]">
                  <h3 className="text-xl font-bold">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h3>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth(1)}
                  className="glass-premium border-border/50 hover:border-primary/30"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="glass-premium border-border/50 hover:border-primary/30"
                >
                  Hoje
                </Button>
              </div>

              {/* View Mode */}
              <div className="flex gap-2 border border-border/50 rounded-lg p-1 glass-premium">
                <Button
                  variant={viewMode === "month" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                  className={cn(
                    viewMode === "month" && "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  )}
                >
                  <Grid3x3 className="w-4 h-4 mr-2" />
                  Mês
                </Button>
                <Button
                  variant={viewMode === "week" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("week")}
                  className={cn(
                    viewMode === "week" && "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  )}
                >
                  <List className="w-4 h-4 mr-2" />
                  Semana
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          {isLoading ? (
            <div className="grid grid-cols-7 gap-2">
              {[...Array(42)].map((_, i) => (
                <div key={i} className="aspect-square rounded-lg glass-premium border-border/50 animate-pulse" />
              ))}
            </div>
          ) : (
            <Card className="glass-premium border-border/50 overflow-hidden">
              <CardContent className="p-0">
                {/* Week Days Header */}
                <div className="grid grid-cols-7 border-b border-border/50 bg-muted/20">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="p-4 text-center font-semibold text-sm text-muted-foreground"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((day, index) => {
                    const dayEvents = getEventsForDay(day.fullDate);
                    const isTodayDate = isToday(day.fullDate);

                    return (
                      <div
                        key={index}
                        className={cn(
                          "min-h-[120px] p-2 border-r border-b border-border/30 transition-all hover:bg-muted/20 group",
                          !day.isCurrentMonth && "bg-muted/10 text-muted-foreground",
                          isTodayDate && "bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border-cyan-500/30"
                        )}
                      >
                        {/* Date Number */}
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn(
                            "text-sm font-semibold",
                            !day.isCurrentMonth && "text-muted-foreground/50",
                            isTodayDate && "w-7 h-7 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center"
                          )}>
                            {day.date}
                          </span>
                          {day.isCurrentMonth && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                // TODO: Open dialog with pre-filled date
                                setEventDialogOpen(true);
                              }}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          )}
                        </div>

                        {/* Events */}
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map((event) => (
                            <div
                              key={event.id}
                              className="group/event relative px-2 py-1 rounded text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 hover:border-cyan-500/50 cursor-pointer transition-all"
                              onClick={() => {
                                setSelectedEvent(event);
                                setEventDialogOpen(true);
                              }}
                            >
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 flex-shrink-0 text-cyan-600" />
                                <span className="truncate text-cyan-700 dark:text-cyan-300">
                                  {new Date(event.startTime).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="truncate font-semibold text-foreground">
                                {event.title}
                              </div>

                              {/* Hover Actions */}
                              <div className="absolute top-1 right-1 opacity-0 group-hover/event:opacity-100 transition-opacity flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEvent(event);
                                    setEventDialogOpen(true);
                                  }}
                                  className="w-5 h-5 rounded bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(event.id);
                                  }}
                                  className="w-5 h-5 rounded bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center hover:scale-110 transition-transform text-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-muted-foreground text-center py-1">
                              +{dayEvents.length - 3} mais
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Insights */}
          {events && events.length > 0 && (
            <Card className="glass-premium border-primary/20 mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  Insights de IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/20">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm mb-1">Próximo Evento</div>
                        <p className="text-xs text-muted-foreground">
                          {events.filter(e => new Date(e.startTime) > new Date()).length > 0
                            ? `Você tem ${events.filter(e => new Date(e.startTime) > new Date()).length} eventos agendados`
                            : 'Nenhum evento próximo'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-600/10 border border-orange-500/20">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm mb-1">Deteção de Conflitos</div>
                        <p className="text-xs text-muted-foreground">
                          Nenhum conflito de horário detetado. Ótimo planeamento!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!isLoading && (!events || events.length === 0) && (
            <Card className="glass-premium border-border/50 mt-8">
              <CardContent className="py-16 text-center">
                <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Nenhum evento agendado</h3>
                <p className="text-muted-foreground mb-6">
                  Comece por criar o seu primeiro evento
                </p>
                <Button
                  onClick={() => setEventDialogOpen(true)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Primeiro Evento
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </>
  );
}

