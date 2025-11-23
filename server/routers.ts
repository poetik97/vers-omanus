import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import prisma from "./db";
import { registerUser, loginUser } from "./auth";
import { tasksRouter } from "./routers/tasks";
import { eventsRouter } from "./routers/events";
import { transactionsRouter } from "./routers/transactions";
import { aiRouter } from "./routers/ai";
import { menstrualRouter } from "./routers/menstrual";
import { diaryRouter } from "./routers/diary";
import { notificationsRouter } from "./routers/notifications";
import { notificationPreferencesRouter } from "./routers/notification-preferences";
import { searchRouter } from "./routers/search";
import { reportsRouter } from "./routers/reports";
import { privacyRouter } from "./routers/privacy";
import { usersRouter } from "./routers/users";

export const appRouter = router({
  system: systemRouter,
  privacy: privacyRouter,
  users: usersRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    register: publicProcedure
      .input(z.object({
        email: z.string().min(3).regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email inválido"),
        password: z.string().min(6),
        name: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const { user, token } = await registerUser(input.email, input.password, input.name);

        // Set cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return { success: true, user };
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().min(3).regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email inválido"),
        password: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { user, token } = await loginUser(input.email, input.password);

        // Set cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return { success: true, user };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  tasks: tasksRouter,

  // Legacy tasks router (deprecated)
  tasksOld: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await prisma.tasks.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: 'desc' },
      });
    }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        status: z.enum(['todo', 'in_progress', 'done', 'archived']).optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        category: z.enum(['work', 'personal', 'health', 'finance', 'other']).optional(),
        dueDate: z.string().optional(),
        scheduledTime: z.string().optional(),
        estimatedTime: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await prisma.tasks.create({
          data: {
            userId: ctx.user.id,
            title: input.title,
            description: input.description,
            status: input.status || 'todo',
            priority: input.priority || 'medium',
            category: input.category || 'other',
            dueDate: input.dueDate ? new Date(input.dueDate) : null,
            scheduledTime: input.scheduledTime,
            estimatedTime: input.estimatedTime,
          },
        });
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        return await prisma.tasks.findFirst({
          where: { id: input.id, userId: ctx.user.id },
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(['todo', 'in_progress', 'done', 'archived']).optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        category: z.enum(['work', 'personal', 'health', 'finance', 'other']).optional(),
        dueDate: z.string().optional(),
        scheduledTime: z.string().optional(),
        estimatedTime: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return await prisma.tasks.update({
          where: { id },
          data: {
            ...data,
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          },
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await prisma.tasks.delete({
          where: { id: input.id },
        });
      }),

    toggleStatus: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const task = await prisma.tasks.findFirst({
          where: { id: input.id, userId: ctx.user.id },
        });
        if (!task) throw new Error('Task not found');

        return await prisma.tasks.update({
          where: { id: input.id },
          data: { status: task.status === 'done' ? 'todo' : 'done' },
        });
      }),
  }),

  events: eventsRouter,

  // Legacy events router (deprecated)
  eventsOld: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await prisma.events.findMany({
        where: { userId: ctx.user.id },
        orderBy: { startTime: 'asc' },
      });
    }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        startTime: z.string(),
        endTime: z.string(),
        location: z.string().optional(),
        category: z.enum(['work', 'personal', 'health', 'finance', 'other']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await prisma.events.create({
          data: {
            userId: ctx.user.id,
            title: input.title,
            description: input.description,
            startTime: new Date(input.startTime),
            endTime: new Date(input.endTime),
            location: input.location,
            category: input.category || 'other',
          },
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        location: z.string().optional(),
        category: z.enum(['work', 'personal', 'health', 'finance', 'other']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return await prisma.events.update({
          where: { id },
          data: {
            ...data,
            startTime: data.startTime ? new Date(data.startTime) : undefined,
            endTime: data.endTime ? new Date(data.endTime) : undefined,
          },
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await prisma.events.delete({
          where: { id: input.id },
        });
      }),
  }),

  goals: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await prisma.goals.findMany({
        where: { userId: ctx.user.id },
        include: { goal_checkins: true },
        orderBy: { createdAt: 'desc' },
      });
    }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        targetValue: z.number(),
        currentValue: z.number().optional(),
        unit: z.string(),
        deadline: z.string().optional(),
        category: z.enum(['work', 'personal', 'health', 'finance', 'other']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await prisma.goals.create({
          data: {
            userId: ctx.user.id,
            title: input.title,
            description: input.description,
            targetValue: input.targetValue,
            currentValue: input.currentValue || 0,
            unit: input.unit,
            deadline: input.deadline ? new Date(input.deadline) : null,
            category: input.category || 'other',
          },
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        targetValue: z.number().optional(),
        currentValue: z.number().optional(),
        unit: z.string().optional(),
        deadline: z.string().optional(),
        category: z.enum(['work', 'personal', 'health', 'finance', 'other']).optional(),
        status: z.enum(['active', 'completed', 'abandoned']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return await prisma.goals.update({
          where: { id },
          data: {
            ...data,
            deadline: data.deadline ? new Date(data.deadline) : undefined,
          },
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await prisma.goals.delete({
          where: { id: input.id },
        });
      }),

    updateProgress: protectedProcedure
      .input(z.object({ id: z.string(), currentValue: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const goal = await prisma.goals.findFirst({
          where: { id: input.id, userId: ctx.user.id },
        });
        if (!goal) throw new Error('Goal not found');

        const status = input.currentValue >= goal.targetValue ? 'completed' : 'active';

        return await prisma.goals.update({
          where: { id: input.id },
          data: {
            currentValue: input.currentValue,
            status,
          },
        });
      }),
  }),

  transactions: transactionsRouter,

  // Legacy transactions router (deprecated)
  transactionsOld: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await prisma.transactions.findMany({
        where: { userId: ctx.user.id },
        orderBy: { date: 'desc' },
      });
    }),

    create: protectedProcedure
      .input(z.object({
        type: z.enum(['income', 'expense']),
        amount: z.number(),
        category: z.string().optional(),
        description: z.string().optional(),
        date: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await prisma.transactions.create({
          data: {
            userId: ctx.user.id,
            type: input.type,
            amount: input.amount,
            category: input.category || 'Outros',
            description: input.description,
            date: input.date ? new Date(input.date) : new Date(),
          },
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        type: z.enum(['income', 'expense']).optional(),
        amount: z.number().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        date: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return await prisma.transactions.update({
          where: { id },
          data: {
            ...data,
            date: data.date ? new Date(data.date) : undefined,
          },
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await prisma.transactions.delete({
          where: { id: input.id },
        });
      }),
  }),

  // Diary Router (Enhanced)
  diary: diaryRouter,

  // Menstrual Cycle Router
  menstrualCycle: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await prisma.menstrualCycle.findMany({
        where: { userId: ctx.user.id },
        orderBy: { startDate: 'desc' },
      });
    }),

    create: protectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string().optional(),
        flow: z.enum(['light', 'medium', 'heavy']).optional(),
        symptoms: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await prisma.menstrualCycle.create({
          data: {
            userId: ctx.user.id,
            startDate: new Date(input.startDate),
            endDate: input.endDate ? new Date(input.endDate) : null,
            flow: input.flow || 'medium',
            symptoms: input.symptoms,
          },
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        flow: z.enum(['light', 'medium', 'heavy']).optional(),
        symptoms: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        return await prisma.menstrualCycle.update({
          where: { id },
          data: {
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined,
          },
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await prisma.menstrualCycle.delete({
          where: { id: input.id },
        });
      }),
  }),

  // AI Assistant Router (Enhanced)
  ai: aiRouter,
  menstrual: menstrualRouter,

  // Notifications Router (Enhanced)
  notifications: notificationsRouter,
  notificationPreferences: notificationPreferencesRouter,

  // Search Router
  search: searchRouter,

  // Reports Router
  reports: reportsRouter,

  // Chat IA Router (Legacy - deprecated)
  chatOld: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await prisma.chatMessage.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: 'asc' },
        take: 50,
      });
    }),

    send: protectedProcedure
      .input(z.object({
        message: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Save user message
        await prisma.chatMessage.create({
          data: {
            userId: ctx.user.id,
            role: 'user',
            content: input.message,
          },
        });

        // TODO: Integrate with GPT-4 API
        const aiResponse = "Funcionalidade de IA será integrada em breve!";

        // Save AI response
        return await prisma.chatMessage.create({
          data: {
            userId: ctx.user.id,
            role: 'assistant',
            content: aiResponse,
          },
        });
      }),
  }),



  // Gamification Router
  gamification: router({
    profile: protectedProcedure.query(async ({ ctx }) => {
      const userBadges = await prisma.userBadge.findMany({
        where: { userId: ctx.user.id },
        include: { badge: true },
      });

      const achievements = await prisma.achievement.findMany({
        where: { userId: ctx.user.id },
        orderBy: { unlockedAt: 'desc' },
      });

      return {
        level: Math.floor(ctx.user.xp / 1000) + 1,
        xp: ctx.user.xp || 0,
        badges: userBadges,
        achievements,
      };
    }),
  }),

  // Dashboard Stats
  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      const [tasksCount, eventsCount, goalsCount, transactions] = await Promise.all([
        prisma.tasks.count({ where: { userId: ctx.user.id, status: { not: 'done' } } }),
        prisma.events.count({ where: { userId: ctx.user.id, startTime: { gte: new Date() } } }),
        prisma.goals.count({ where: { userId: ctx.user.id, status: 'active' } }),
        prisma.transactions.findMany({
          where: { userId: ctx.user.id },
          select: { type: true, amount: true },
        }),
      ]);

      const balance = transactions.reduce((acc, t) => {
        return acc + (t.type === 'income' ? t.amount : -t.amount);
      }, 0);

      return {
        tasksCount,
        eventsCount,
        goalsCount,
        balance,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
