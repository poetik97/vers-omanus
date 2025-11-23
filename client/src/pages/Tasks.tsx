import React, { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  Flag,
  Sparkles,
  Search,
  Filter,
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  Edit2,
  Trash2,
  Check,
  X,
  GripVertical,
  CheckCircle2,
  Circle,
  AlertCircle,
  TrendingUp,
  Target
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type ViewMode = "list" | "kanban" | "calendar";
type FilterStatus = "all" | "todo" | "in_progress" | "completed";
type FilterPriority = "all" | "low" | "medium" | "high";

interface SortableTaskProps {
  task: any;
  onToggleStatus: (id: number) => void;
  onEdit: (task: any) => void;
  onDelete: (id: number) => void;
}

function SortableTask({ task, onToggleStatus, onEdit, onDelete }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityConfig = {
    low: { color: 'text-green-600', bg: 'bg-green-500/10', border: 'border-green-500/20', label: '🟢 Baixa' },
    medium: { color: 'text-orange-600', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: '🟠 Média' },
    high: { color: 'text-red-600', bg: 'bg-red-500/10', border: 'border-red-500/20', label: '🔴 Alta' },
  };

  const statusConfig = {
    todo: { color: 'text-gray-600', bg: 'bg-gray-500/10', label: 'A Fazer' },
    in_progress: { color: 'text-blue-600', bg: 'bg-blue-500/10', label: 'Em Progresso' },
    completed: { color: 'text-green-600', bg: 'bg-green-500/10', label: 'Concluída' },
  };

  const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;
  const status = statusConfig[task.status as keyof typeof statusConfig] || statusConfig.todo;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group p-4 rounded-lg border transition-all duration-300",
        "bg-gradient-to-r from-background to-muted/20",
        task.status === 'completed' ? 'border-green-500/20' : 'border-border/50',
        "hover:border-primary/30 hover:shadow-lg"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Checkbox */}
        <button
          onClick={() => onToggleStatus(task.id)}
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 transition-all",
            task.status === 'completed'
              ? 'bg-green-500 border-green-500'
              : 'border-muted-foreground hover:border-primary hover:scale-110'
          )}
        >
          {task.status === 'completed' && <Check className="w-4 h-4 text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={cn(
              "font-semibold text-base",
              task.status === 'completed' && 'line-through text-muted-foreground'
            )}>
              {task.title}
            </h3>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority Badge */}
            <span className={cn(
              "text-xs px-2 py-1 rounded-full font-medium",
              priority.bg,
              priority.color,
              priority.border,
              "border"
            )}>
              {priority.label}
            </span>

            {/* Status Badge */}
            <span className={cn(
              "text-xs px-2 py-1 rounded-full font-medium",
              status.bg,
              status.color
            )}>
              {status.label}
            </span>

            {/* Category */}
            {task.category && (
              <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-600 font-medium">
                {task.category}
              </span>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <span className={cn(
                "text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1",
                isOverdue
                  ? 'bg-red-500/10 text-red-600'
                  : 'bg-blue-500/10 text-blue-600'
              )}>
                <Calendar className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                {isOverdue && <AlertCircle className="w-3 h-3" />}
              </span>
            )}

            {/* Estimated Time */}
            {task.estimatedTime && (
              <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-600 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {task.estimatedTime}min
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Tasks() {
  // Bypass authentication
  const user = { name: "Utilizador", id: "demo-user" };
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterPriority, setFilterPriority] = useState<FilterPriority>("all");
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  // Fetch tasks from backend
  const { data: tasksData, isLoading, refetch } = trpc.tasks.list.useQuery();
  const tasks = tasksData?.tasks || [];
  const toggleStatusMutation = trpc.tasks.toggleStatus.useMutation({
    onSuccess: () => refetch()
  });
  const deleteMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => refetch()
  });

  // AI Integration
  const [quickAddInput, setQuickAddInput] = useState("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const { data: aiSuggestions } = trpc.ai.suggestTasks.useQuery();

  const createTaskMutation = trpc.ai.createTaskFromNLP.useMutation({
    onSuccess: (data) => {
      refetch();
      setQuickAddInput("");
      setIsProcessingAI(false);
      // Optional: Show toast with success message
    },
    onError: () => {
      setIsProcessingAI(false);
    }
  });

  const handleAIQuickAdd = () => {
    if (!quickAddInput.trim()) return;
    setIsProcessingAI(true);
    createTaskMutation.mutate({ message: quickAddInput });
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );



  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    return tasks.filter(task => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDescription = task.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription) return false;
      }

      // Status filter
      if (filterStatus !== "all" && task.status !== filterStatus) return false;

      // Priority filter
      if (filterPriority !== "all" && task.priority !== filterPriority) return false;

      return true;
    });
  }, [tasks, searchQuery, filterStatus, filterPriority]);

  // Calculate stats
  const stats = {
    total: tasks?.length || 0,
    todo: tasks?.filter(t => t.status === 'todo').length || 0,
    inProgress: tasks?.filter(t => t.status === 'in_progress').length || 0,
    completed: tasks?.filter(t => t.status === 'completed').length || 0,
    completionRate: tasks && tasks.length > 0
      ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
      : 0
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredTasks.findIndex(t => t.id === active.id);
      const newIndex = filteredTasks.findIndex(t => t.id === over.id);

      // In a real app, you would update the order in the backend here
      console.log('Reorder:', { from: oldIndex, to: newIndex });
    }
  };

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate({ id });
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setTaskDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem a certeza que deseja eliminar esta tarefa?')) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <>
      <AddTaskDialog
        open={taskDialogOpen}
        onOpenChange={(open) => {
          setTaskDialogOpen(open);
          if (!open) setEditingTask(null);
        }}
        initialData={editingTask}
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/20 dark:to-purple-950/10">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
                  <CheckSquare className="w-8 h-8 text-primary" />
                  Gestão de Tarefas
                </h1>
                <p className="text-muted-foreground">
                  Organize e priorize as suas tarefas com eficiência
                </p>
              </div>

              {/* Quick Add with AI */}
              <div className="flex-1 max-w-xl mx-4 hidden lg:block">
                <div className="relative">
                  <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-pulse" />
                  <Input
                    placeholder='Adicione tarefa com IA: "Comprar leite amanhã às 18h"...'
                    className="pl-9 pr-20 glass-premium border-primary/20 focus:border-primary/50"
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
                    className="absolute right-1 top-1 h-8"
                    onClick={handleAIQuickAdd}
                    disabled={isProcessingAI || !quickAddInput.trim()}
                  >
                    {isProcessingAI ? "..." : "Adicionar"}
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => {
                  setEditingTask(null);
                  setTaskDialogOpen(true);
                }}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nova Tarefa
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card className="glass-premium border-border/50 hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <CheckSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold gradient-text">{stats.total}</div>
                </CardContent>
              </Card>

              <Card className="glass-premium border-border/50 hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">A Fazer</span>
                    <Circle className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-600">{stats.todo}</div>
                </CardContent>
              </Card>

              <Card className="glass-premium border-border/50 hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Em Progresso</span>
                    <Target className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                </CardContent>
              </Card>

              <Card className="glass-premium border-border/50 hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Concluídas</span>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                </CardContent>
              </Card>

              <Card className="glass-premium border-border/50 hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Taxa</span>
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {stats.completionRate}%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar tarefas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 glass-premium border-border/50 focus:border-primary/50"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                {(['all', 'todo', 'in_progress', 'completed'] as FilterStatus[]).map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className={cn(
                      filterStatus === status && "bg-gradient-to-r from-primary to-purple-600 text-white"
                    )}
                  >
                    {status === 'all' && 'Todas'}
                    {status === 'todo' && 'A Fazer'}
                    {status === 'in_progress' && 'Em Progresso'}
                    {status === 'completed' && 'Concluídas'}
                  </Button>
                ))}
              </div>

              {/* Priority Filter */}
              <div className="flex gap-2">
                {(['all', 'low', 'medium', 'high'] as FilterPriority[]).map((priority) => (
                  <Button
                    key={priority}
                    variant={filterPriority === priority ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterPriority(priority)}
                    className={cn(
                      filterPriority === priority && "bg-gradient-to-r from-primary to-purple-600 text-white"
                    )}
                  >
                    {priority === 'all' && <Flag className="w-4 h-4" />}
                    {priority === 'low' && '🟢'}
                    {priority === 'medium' && '🟠'}
                    {priority === 'high' && '🔴'}
                  </Button>
                ))}
              </div>

              {/* View Mode */}
              <div className="flex gap-2 border border-border/50 rounded-lg p-1 glass-premium">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "h-8 w-8 p-0",
                    viewMode === "list" && "bg-gradient-to-r from-primary to-purple-600 text-white"
                  )}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "kanban" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("kanban")}
                  className={cn(
                    "h-8 w-8 p-0",
                    viewMode === "kanban" && "bg-gradient-to-r from-primary to-purple-600 text-white"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "calendar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className={cn(
                    "h-8 w-8 p-0",
                    viewMode === "calendar" && "bg-gradient-to-r from-primary to-purple-600 text-white"
                  )}
                >
                  <CalendarIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 rounded-lg glass-premium border-border/50 animate-pulse" />
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <Card className="glass-premium border-border/50">
              <CardContent className="py-16 text-center">
                <CheckSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Nenhuma tarefa encontrada</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || filterStatus !== 'all' || filterPriority !== 'all'
                    ? 'Tente ajustar os filtros de pesquisa'
                    : 'Comece por criar a sua primeira tarefa'
                  }
                </p>
                <Button
                  onClick={() => setTaskDialogOpen(true)}
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Primeira Tarefa
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredTasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <SortableTask
                      key={task.id}
                      task={task}
                      onToggleStatus={handleToggleStatus}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* AI Insights */}
          {filteredTasks.length > 0 && (
            <Card className="glass-premium border-primary/20 mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  Insights de IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/20">
                    <p className="text-sm">
                      💡 <strong>Sugestão:</strong> Você tem {stats.todo} tarefas pendentes.
                      Priorize as de alta prioridade para aumentar a produtividade!
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/20">
                    <p className="text-sm">
                      📊 <strong>Progresso:</strong> Sua taxa de conclusão é de {stats.completionRate}%.
                      {stats.completionRate >= 70 ? 'Excelente trabalho!' : 'Continue assim!'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Suggestions */}
          {aiSuggestions?.suggestions && aiSuggestions.suggestions.length > 0 && (
            <Card className="glass-premium border-purple-500/20 mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Sugestões da IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aiSuggestions.suggestions.map((suggestion: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10 hover:border-purple-500/30 transition-all cursor-pointer"
                      onClick={() => {
                        setQuickAddInput(suggestion.title);
                        // Optional: auto-submit or just fill
                      }}>
                      <div className="font-medium text-sm mb-1">{suggestion.title}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="px-1.5 py-0.5 rounded bg-background/50 border border-border/50">
                          {suggestion.category}
                        </span>
                        <span>{suggestion.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </>
  );
}

