import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import prisma from "../db";
import { Prisma } from "@prisma/client";

export const searchRouter = router({
  // Global search across all entities
  global: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      types: z.array(z.enum(['tasks', 'events', 'transactions', 'goals', 'diary'])).optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { query, types, limit = 20 } = input;
      const searchTypes = types || ['tasks', 'events', 'transactions', 'goals', 'diary'];

      const results: any[] = [];

      // Search tasks
      if (searchTypes.includes('tasks')) {
        const tasks = await prisma.tasks.findMany({
          where: {
            userId: ctx.user.id,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: limit,
          orderBy: { createdAt: 'desc' },
        });

        results.push(...tasks.map(task => ({
          type: 'task' as const,
          id: task.id,
          title: task.title,
          description: task.description,
          metadata: {
            status: task.status,
            priority: task.priority,
            category: task.category,
            dueDate: task.dueDate,
          },
          url: `/tasks/${task.id}`,
          icon: '✅',
        })));
      }

      // Search events
      if (searchTypes.includes('events')) {
        const events = await prisma.events.findMany({
          where: {
            userId: ctx.user.id,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { location: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: limit,
          orderBy: { startTime: 'desc' },
        });

        results.push(...events.map(event => ({
          type: 'event' as const,
          id: event.id,
          title: event.title,
          description: event.description,
          metadata: {
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location,
            category: event.category,
          },
          url: `/calendar?event=${event.id}`,
          icon: '📅',
        })));
      }

      // Search transactions
      if (searchTypes.includes('transactions')) {
        const transactions = await prisma.transactions.findMany({
          where: {
            userId: ctx.user.id,
            OR: [
              { description: { contains: query, mode: 'insensitive' } },
              { category: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: limit,
          orderBy: { date: 'desc' },
        });

        results.push(...transactions.map(transaction => ({
          type: 'transaction' as const,
          id: transaction.id,
          title: `${transaction.type === 'income' ? '+' : '-'}€${transaction.amount.toFixed(2)} - ${transaction.category}`,
          description: transaction.description,
          metadata: {
            type: transaction.type,
            amount: transaction.amount,
            category: transaction.category,
            date: transaction.date,
          },
          url: `/finances?transaction=${transaction.id}`,
          icon: transaction.type === 'income' ? '💰' : '💸',
        })));
      }

      // Search goals
      if (searchTypes.includes('goals')) {
        const goals = await prisma.goals.findMany({
          where: {
            userId: ctx.user.id,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: limit,
          orderBy: { createdAt: 'desc' },
        });

        results.push(...goals.map(goal => ({
          type: 'goal' as const,
          id: goal.id,
          title: goal.title,
          description: goal.description,
          metadata: {
            status: goal.status,
            progress: Math.round((goal.currentValue / goal.targetValue) * 100),
            category: goal.category,
          },
          url: `/goals/${goal.id}`,
          icon: '🎯',
        })));
      }

      // Search diary
      if (searchTypes.includes('diary')) {
        const diary = await prisma.diary_entries.findMany({
          where: {
            userId: ctx.user.id,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
            ],
          },
          take: limit,
          orderBy: { date: 'desc' },
        });

        results.push(...diary.map(entry => ({
          type: 'diary' as const,
          id: entry.id,
          title: entry.title,
          description: entry.content?.substring(0, 100),
          metadata: {
            mood: entry.mood,
            date: entry.date,
          },
          url: `/diary/${entry.id}`,
          icon: '📔',
        })));
      }

      // Sort by relevance (simple: by creation date for now)
      // TODO: Implement proper relevance scoring
      return results.slice(0, limit);
    }),

  // Quick actions (command palette)
  quickActions: protectedProcedure
    .input(z.object({
      query: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const query = input?.query?.toLowerCase() || '';

      const actions = [
        // Navigation
        { id: 'nav-dashboard', title: 'Ir para Dashboard', icon: '🏠', url: '/dashboard', category: 'Navegação' },
        { id: 'nav-tasks', title: 'Ver Tarefas', icon: '✅', url: '/tasks', category: 'Navegação' },
        { id: 'nav-calendar', title: 'Ver Calendário', icon: '📅', url: '/calendar', category: 'Navegação' },
        { id: 'nav-finances', title: 'Ver Finanças', icon: '💰', url: '/finances', category: 'Navegação' },
        { id: 'nav-goals', title: 'Ver Objetivos', icon: '🎯', url: '/goals', category: 'Navegação' },
        { id: 'nav-diary', title: 'Ver Diário', icon: '📔', url: '/diary', category: 'Navegação' },
        { id: 'nav-ai', title: 'Assistente IA', icon: '🤖', url: '/ai-assistant', category: 'Navegação' },
        
        // Create actions
        { id: 'create-task', title: 'Nova Tarefa', icon: '➕', action: 'create-task', category: 'Criar' },
        { id: 'create-event', title: 'Novo Evento', icon: '📅', action: 'create-event', category: 'Criar' },
        { id: 'create-transaction', title: 'Nova Transação', icon: '💸', action: 'create-transaction', category: 'Criar' },
        { id: 'create-goal', title: 'Novo Objetivo', icon: '🎯', action: 'create-goal', category: 'Criar' },
        { id: 'create-diary', title: 'Nova Entrada no Diário', icon: '📝', action: 'create-diary', category: 'Criar' },
        
        // View filters
        { id: 'filter-tasks-today', title: 'Tarefas de Hoje', icon: '📋', url: '/tasks?filter=today', category: 'Filtros' },
        { id: 'filter-tasks-week', title: 'Tarefas da Semana', icon: '📅', url: '/tasks?filter=week', category: 'Filtros' },
        { id: 'filter-tasks-high', title: 'Tarefas Prioritárias', icon: '🔴', url: '/tasks?priority=high', category: 'Filtros' },
        { id: 'filter-tasks-overdue', title: 'Tarefas Atrasadas', icon: '⚠️', url: '/tasks?status=overdue', category: 'Filtros' },
        
        // Reports
        { id: 'report-productivity', title: 'Relatório de Produtividade', icon: '📊', url: '/reports/productivity', category: 'Relatórios' },
        { id: 'report-finances', title: 'Relatório Financeiro', icon: '💹', url: '/reports/finances', category: 'Relatórios' },
        { id: 'report-goals', title: 'Progresso de Objetivos', icon: '📈', url: '/reports/goals', category: 'Relatórios' },
        
        // Settings
        { id: 'settings-profile', title: 'Editar Perfil', icon: '👤', url: '/settings/profile', category: 'Configurações' },
        { id: 'settings-notifications', title: 'Notificações', icon: '🔔', url: '/settings/notifications', category: 'Configurações' },
        { id: 'settings-theme', title: 'Tema', icon: '🎨', action: 'toggle-theme', category: 'Configurações' },
        
        // AI actions
        { id: 'ai-analyze', title: 'Analisar Produtividade', icon: '🤖', action: 'ai-analyze', category: 'IA' },
        { id: 'ai-insights', title: 'Obter Insights', icon: '💡', action: 'ai-insights', category: 'IA' },
        { id: 'ai-suggest', title: 'Sugerir Tarefas', icon: '✨', action: 'ai-suggest', category: 'IA' },
        
        // Quick stats
        { id: 'stats-today', title: 'Resumo de Hoje', icon: '📊', action: 'show-daily-summary', category: 'Estatísticas' },
        { id: 'stats-week', title: 'Resumo da Semana', icon: '📅', action: 'show-weekly-summary', category: 'Estatísticas' },
      ];

      // Filter by query
      const filtered = query
        ? actions.filter(action =>
            action.title.toLowerCase().includes(query) ||
            action.category.toLowerCase().includes(query)
          )
        : actions;

      return filtered;
    }),

  // Recent items
  recent: protectedProcedure
    .input(z.object({
      limit: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit || 10;

      const [recentTasks, recentEvents, recentTransactions] = await Promise.all([
        prisma.tasks.findMany({
          where: { userId: ctx.user.id },
          orderBy: { updatedAt: 'desc' },
          take: 3,
        }),
        prisma.events.findMany({
          where: { userId: ctx.user.id },
          orderBy: { updatedAt: 'desc' },
          take: 3,
        }),
        prisma.transactions.findMany({
          where: { userId: ctx.user.id },
          orderBy: { createdAt: 'desc' },
          take: 3,
        }),
      ]);

      const results = [
        ...recentTasks.map(task => ({
          type: 'task' as const,
          id: task.id,
          title: task.title,
          timestamp: task.updatedAt,
          url: `/tasks/${task.id}`,
          icon: '✅',
        })),
        ...recentEvents.map(event => ({
          type: 'event' as const,
          id: event.id,
          title: event.title,
          timestamp: event.updatedAt,
          url: `/calendar?event=${event.id}`,
          icon: '📅',
        })),
        ...recentTransactions.map(transaction => ({
          type: 'transaction' as const,
          id: transaction.id,
          title: `${transaction.type === 'income' ? '+' : '-'}€${transaction.amount.toFixed(2)}`,
          timestamp: transaction.createdAt,
          url: `/finances?transaction=${transaction.id}`,
          icon: transaction.type === 'income' ? '💰' : '💸',
        })),
      ];

      // Sort by timestamp
      results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return results.slice(0, limit);
    }),

  // Suggestions based on context
  suggestions: protectedProcedure
    .input(z.object({
      context: z.enum(['dashboard', 'tasks', 'calendar', 'finances']).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const context = input?.context || 'dashboard';
      const suggestions: any[] = [];

      // Get user stats
      const [pendingTasks, upcomingEvents, recentTransactions] = await Promise.all([
        prisma.tasks.count({
          where: { userId: ctx.user.id, status: { not: 'done' } },
        }),
        prisma.events.count({
          where: {
            userId: ctx.user.id,
            startTime: { gte: new Date() },
          },
        }),
        prisma.transactions.count({
          where: { userId: ctx.user.id },
        }),
      ]);

      // Context-based suggestions
      if (context === 'dashboard') {
        if (pendingTasks === 0) {
          suggestions.push({
            id: 'create-first-task',
            title: 'Criar primeira tarefa',
            description: 'Começa a organizar o teu dia',
            action: 'create-task',
            icon: '✅',
          });
        }

        if (upcomingEvents === 0) {
          suggestions.push({
            id: 'create-first-event',
            title: 'Adicionar evento ao calendário',
            description: 'Planeia a tua semana',
            action: 'create-event',
            icon: '📅',
          });
        }

        if (recentTransactions === 0) {
          suggestions.push({
            id: 'create-first-transaction',
            title: 'Registar primeira transação',
            description: 'Começa a controlar as tuas finanças',
            action: 'create-transaction',
            icon: '💰',
          });
        }
      }

      if (context === 'tasks' && pendingTasks > 10) {
        suggestions.push({
          id: 'organize-tasks',
          title: 'Organizar tarefas',
          description: `Tens ${pendingTasks} tarefas pendentes. Que tal priorizá-las?`,
          url: '/tasks?sort=priority',
          icon: '📋',
        });
      }

      return suggestions;
    }),
});
