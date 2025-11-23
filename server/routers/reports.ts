import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import prisma from "../db";

export const reportsRouter = router({
  // Productivity report
  productivity: protectedProcedure
    .input(z.object({
      period: z.enum(['week', 'month', 'quarter', 'year']).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const period = input?.period || 'month';
      const now = new Date();
      
      let startDate: Date;
      let endDate = input?.endDate ? new Date(input.endDate) : now;

      if (input?.startDate) {
        startDate = new Date(input.startDate);
      } else {
        switch (period) {
          case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'quarter':
            startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        }
      }

      // Get tasks in period
      const tasks = await prisma.tasks.findMany({
        where: {
          userId: ctx.user.id,
          createdAt: { gte: startDate, lte: endDate },
        },
      });

      const completedTasks = tasks.filter(t => t.status === 'done');
      const overdueTasks = tasks.filter(
        t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now
      );

      // Group by day for chart
      const tasksByDay: Record<string, { created: number; completed: number }> = {};
      tasks.forEach(task => {
        const day = task.createdAt.toISOString().split('T')[0];
        if (!tasksByDay[day]) tasksByDay[day] = { created: 0, completed: 0 };
        tasksByDay[day].created++;
      });

      completedTasks.forEach(task => {
        if (task.completedAt) {
          const day = task.completedAt.toISOString().split('T')[0];
          if (!tasksByDay[day]) tasksByDay[day] = { created: 0, completed: 0 };
          tasksByDay[day].completed++;
        }
      });

      // Group by category
      const byCategory: Record<string, { total: number; completed: number }> = {};
      tasks.forEach(task => {
        if (!byCategory[task.category]) {
          byCategory[task.category] = { total: 0, completed: 0 };
        }
        byCategory[task.category].total++;
        if (task.status === 'done') {
          byCategory[task.category].completed++;
        }
      });

      // Group by priority
      const byPriority: Record<string, { total: number; completed: number }> = {};
      tasks.forEach(task => {
        if (!byPriority[task.priority]) {
          byPriority[task.priority] = { total: 0, completed: 0 };
        }
        byPriority[task.priority].total++;
        if (task.status === 'done') {
          byPriority[task.priority].completed++;
        }
      });

      // Calculate average completion time
      const completionTimes = completedTasks
        .filter(t => t.completedAt && t.createdAt)
        .map(t => {
          const created = new Date(t.createdAt).getTime();
          const completed = new Date(t.completedAt!).getTime();
          return (completed - created) / (1000 * 60 * 60); // hours
        });

      const avgCompletionTime = completionTimes.length > 0
        ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        : 0;

      return {
        period: { startDate, endDate },
        summary: {
          totalTasks: tasks.length,
          completedTasks: completedTasks.length,
          pendingTasks: tasks.filter(t => t.status !== 'done').length,
          overdueTasks: overdueTasks.length,
          completionRate: tasks.length > 0 
            ? Math.round((completedTasks.length / tasks.length) * 100) 
            : 0,
          avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
        },
        charts: {
          tasksByDay: Object.entries(tasksByDay).map(([date, data]) => ({
            date,
            created: data.created,
            completed: data.completed,
          })),
          byCategory: Object.entries(byCategory).map(([category, data]) => ({
            category,
            total: data.total,
            completed: data.completed,
            rate: Math.round((data.completed / data.total) * 100),
          })),
          byPriority: Object.entries(byPriority).map(([priority, data]) => ({
            priority,
            total: data.total,
            completed: data.completed,
            rate: Math.round((data.completed / data.total) * 100),
          })),
        },
      };
    }),

  // Financial report
  financial: protectedProcedure
    .input(z.object({
      period: z.enum(['week', 'month', 'quarter', 'year']).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const period = input?.period || 'month';
      const now = new Date();
      
      let startDate: Date;
      let endDate = input?.endDate ? new Date(input.endDate) : now;

      if (input?.startDate) {
        startDate = new Date(input.startDate);
      } else {
        switch (period) {
          case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'quarter':
            startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        }
      }

      // Get transactions in period
      const transactions = await prisma.transactions.findMany({
        where: {
          userId: ctx.user.id,
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: 'asc' },
      });

      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      // Group by day for chart
      const byDay: Record<string, { income: number; expenses: number }> = {};
      transactions.forEach(transaction => {
        const day = transaction.date.toISOString().split('T')[0];
        if (!byDay[day]) byDay[day] = { income: 0, expenses: 0 };
        
        if (transaction.type === 'income') {
          byDay[day].income += transaction.amount;
        } else {
          byDay[day].expenses += transaction.amount;
        }
      });

      // Group by category
      const expensesByCategory: Record<string, number> = {};
      const incomeByCategory: Record<string, number> = {};

      transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
          expensesByCategory[transaction.category] = 
            (expensesByCategory[transaction.category] || 0) + transaction.amount;
        } else {
          incomeByCategory[transaction.category] = 
            (incomeByCategory[transaction.category] || 0) + transaction.amount;
        }
      });

      // Calculate days
      const daysDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

      return {
        period: { startDate, endDate },
        summary: {
          totalIncome: Math.round(income * 100) / 100,
          totalExpenses: Math.round(expenses * 100) / 100,
          balance: Math.round((income - expenses) * 100) / 100,
          savingsRate: income > 0 ? Math.round(((income - expenses) / income) * 100) : 0,
          avgDailyIncome: Math.round((income / daysDiff) * 100) / 100,
          avgDailyExpenses: Math.round((expenses / daysDiff) * 100) / 100,
          transactionCount: transactions.length,
        },
        charts: {
          byDay: Object.entries(byDay).map(([date, data]) => ({
            date,
            income: Math.round(data.income * 100) / 100,
            expenses: Math.round(data.expenses * 100) / 100,
            balance: Math.round((data.income - data.expenses) * 100) / 100,
          })),
          expensesByCategory: Object.entries(expensesByCategory)
            .map(([category, amount]) => ({
              category,
              amount: Math.round(amount * 100) / 100,
              percentage: Math.round((amount / expenses) * 100),
            }))
            .sort((a, b) => b.amount - a.amount),
          incomeByCategory: Object.entries(incomeByCategory)
            .map(([category, amount]) => ({
              category,
              amount: Math.round(amount * 100) / 100,
              percentage: Math.round((amount / income) * 100),
            }))
            .sort((a, b) => b.amount - a.amount),
        },
      };
    }),

  // Goals progress report
  goals: protectedProcedure.query(async ({ ctx }) => {
    const goals = await prisma.goals.findMany({
      where: { userId: ctx.user.id },
      include: {
        goal_checkins: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    const activeGoals = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');

    const goalsData = goals.map(goal => {
      const progress = (goal.currentValue / goal.targetValue) * 100;
      const daysLeft = goal.deadline 
        ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        id: goal.id,
        title: goal.title,
        category: goal.category,
        status: goal.status,
        progress: Math.min(100, Math.round(progress)),
        currentValue: goal.currentValue,
        targetValue: goal.targetValue,
        unit: goal.unit,
        daysLeft,
        isOnTrack: daysLeft && daysLeft > 0 ? progress >= 50 : null,
      };
    });

    return {
      summary: {
        totalGoals: goals.length,
        activeGoals: activeGoals.length,
        completedGoals: completedGoals.length,
        completionRate: goals.length > 0 
          ? Math.round((completedGoals.length / goals.length) * 100) 
          : 0,
      },
      goals: goalsData,
      charts: {
        byCategory: Object.entries(
          goals.reduce((acc, goal) => {
            acc[goal.category] = (acc[goal.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([category, count]) => ({ category, count })),
        byStatus: Object.entries(
          goals.reduce((acc, goal) => {
            acc[goal.status] = (acc[goal.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([status, count]) => ({ status, count })),
      },
    };
  }),

  // Weekly summary
  weeklySummary: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const [tasks, events, transactions] = await Promise.all([
      prisma.tasks.findMany({
        where: {
          userId: ctx.user.id,
          createdAt: { gte: weekStart, lte: weekEnd },
        },
      }),
      prisma.events.findMany({
        where: {
          userId: ctx.user.id,
          startTime: { gte: weekStart, lte: weekEnd },
        },
      }),
      prisma.transactions.findMany({
        where: {
          userId: ctx.user.id,
          date: { gte: weekStart, lte: weekEnd },
        },
      }),
    ]);

    const completedTasks = tasks.filter(t => t.status === 'done');
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    return {
      period: { start: weekStart, end: weekEnd },
      tasks: {
        created: tasks.length,
        completed: completedTasks.length,
        completionRate: tasks.length > 0 
          ? Math.round((completedTasks.length / tasks.length) * 100) 
          : 0,
      },
      events: {
        total: events.length,
        byDay: Array.from({ length: 7 }, (_, i) => {
          const day = new Date(weekStart);
          day.setDate(weekStart.getDate() + i);
          const dayEvents = events.filter(e => 
            new Date(e.startTime).toDateString() === day.toDateString()
          );
          return {
            date: day.toISOString().split('T')[0],
            count: dayEvents.length,
          };
        }),
      },
      finances: {
        income: Math.round(income * 100) / 100,
        expenses: Math.round(expenses * 100) / 100,
        balance: Math.round((income - expenses) * 100) / 100,
      },
    };
  }),

  // Export report as JSON (for PDF generation on frontend)
  export: protectedProcedure
    .input(z.object({
      type: z.enum(['productivity', 'financial', 'goals', 'weekly']),
      period: z.enum(['week', 'month', 'quarter', 'year']).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      let data: any;

      switch (input.type) {
        case 'productivity':
          data = await ctx.caller.reports.productivity({
            period: input.period,
            startDate: input.startDate,
            endDate: input.endDate,
          });
          break;
        case 'financial':
          data = await ctx.caller.reports.financial({
            period: input.period,
            startDate: input.startDate,
            endDate: input.endDate,
          });
          break;
        case 'goals':
          data = await ctx.caller.reports.goals();
          break;
        case 'weekly':
          data = await ctx.caller.reports.weeklySummary();
          break;
      }

      return {
        type: input.type,
        generatedAt: new Date().toISOString(),
        user: {
          name: ctx.user.name,
          email: ctx.user.email,
        },
        data,
      };
    }),
});
