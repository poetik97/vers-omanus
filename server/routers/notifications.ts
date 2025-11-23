import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import prisma from "../db";

// Web Push Notification helper
async function sendWebPushNotification(userId: string, notification: {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}) {
  // TODO: Implement with web-push library
  // For now, just create notification in database
  await prisma.notifications.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      title: notification.title,
      message: notification.body,
      type: 'push',
      actionUrl: notification.url,
      read: false,
      createdAt: new Date(),
    },
  });

  console.log(`[Push Notification] ${notification.title} -> User ${userId}`);
}

// Email notification helper
async function sendEmailNotification(userId: string, email: {
  subject: string;
  body: string;
  actionUrl?: string;
}) {
  // TODO: Implement with nodemailer or SendGrid
  // For now, just create notification in database
  await prisma.notifications.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      title: email.subject,
      message: email.body,
      type: 'email',
      actionUrl: email.actionUrl,
      read: false,
      createdAt: new Date(),
    },
  });

  console.log(`[Email Notification] ${email.subject} -> User ${userId}`);
}

export const notificationsRouter = router({
  // List all notifications
  list: protectedProcedure
    .input(z.object({
      unreadOnly: z.boolean().optional(),
      limit: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const { unreadOnly = false, limit = 20 } = input || {};

      return await prisma.notifications.findMany({
        where: {
          userId: ctx.user.id,
          ...(unreadOnly && { read: false }),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    }),

  // Get unread count
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.notifications.count({
      where: {
        userId: ctx.user.id,
        read: false,
      },
    });
  }),

  // Mark as read
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.notifications.update({
        where: { id: input.id, userId: ctx.user.id },
        data: { read: true },
      });
    }),

  // Mark all as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await prisma.notifications.updateMany({
      where: {
        userId: ctx.user.id,
        read: false,
      },
      data: { read: true },
    });

    return { updated: result.count };
  }),

  // Delete notification
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await prisma.notifications.delete({
        where: { id: input.id, userId: ctx.user.id },
      });

      return { success: true };
    }),

  // Delete all read notifications
  deleteAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await prisma.notifications.deleteMany({
      where: {
        userId: ctx.user.id,
        read: true,
      },
    });

    return { deleted: result.count };
  }),

  // Send test notification
  sendTest: protectedProcedure
    .input(z.object({
      type: z.enum(['push', 'email']),
      title: z.string(),
      message: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.type === 'push') {
        await sendWebPushNotification(ctx.user.id, {
          title: input.title,
          body: input.message,
          icon: '/icon-192.png',
        });
      } else {
        await sendEmailNotification(ctx.user.id, {
          subject: input.title,
          body: input.message,
        });
      }

      return { success: true };
    }),

  // Schedule task reminder
  scheduleTaskReminder: protectedProcedure
    .input(z.object({
      taskId: z.string(),
      reminderTime: z.string(), // ISO date
    }))
    .mutation(async ({ ctx, input }) => {
      const task = await prisma.tasks.findFirst({
        where: { id: input.taskId, userId: ctx.user.id },
      });

      if (!task) {
        throw new Error('Tarefa não encontrada');
      }

      // TODO: Schedule with cron or queue system
      // For now, create notification immediately if time has passed
      const reminderDate = new Date(input.reminderTime);
      const now = new Date();

      if (reminderDate <= now) {
        await sendWebPushNotification(ctx.user.id, {
          title: '⏰ Lembrete de Tarefa',
          body: `"${task.title}" está próxima do prazo!`,
          url: `/tasks/${task.id}`,
        });
      }

      return { success: true, scheduled: reminderDate > now };
    }),

  // Send daily summary email
  sendDailySummary: protectedProcedure.mutation(async ({ ctx }) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [tasksDueToday, eventsToday] = await Promise.all([
      prisma.tasks.count({
        where: {
          userId: ctx.user.id,
          dueDate: { gte: startOfDay, lte: endOfDay },
          status: { not: 'done' },
        },
      }),
      prisma.events.count({
        where: {
          userId: ctx.user.id,
          startTime: { gte: startOfDay, lte: endOfDay },
        },
      }),
    ]);

    await sendEmailNotification(ctx.user.id, {
      subject: '📅 Resumo Diário - Organiza-te360',
      body: `Bom dia! Hoje tens ${tasksDueToday} tarefas e ${eventsToday} eventos agendados.`,
      actionUrl: '/dashboard',
    });

    return { success: true };
  }),

  // Notify overdue tasks
  notifyOverdueTasks: protectedProcedure.mutation(async ({ ctx }) => {
    const now = new Date();

    const overdueTasks = await prisma.tasks.findMany({
      where: {
        userId: ctx.user.id,
        status: { not: 'done' },
        dueDate: { lt: now },
      },
      take: 5,
    });

    if (overdueTasks.length > 0) {
      await sendWebPushNotification(ctx.user.id, {
        title: '⚠️ Tarefas Atrasadas',
        body: `Tens ${overdueTasks.length} tarefas atrasadas. Vê agora!`,
        url: '/tasks?status=overdue',
      });
    }

    return { count: overdueTasks.length };
  }),

  // Notify upcoming events
  notifyUpcomingEvents: protectedProcedure
    .input(z.object({
      minutesBefore: z.number().optional(),
    }).optional())
    .mutation(async ({ ctx, input }) => {
      const minutesBefore = input?.minutesBefore || 15;
      const now = new Date();
      const futureTime = new Date(now.getTime() + minutesBefore * 60 * 1000);

      const upcomingEvents = await prisma.events.findMany({
        where: {
          userId: ctx.user.id,
          startTime: {
            gte: now,
            lte: futureTime,
          },
        },
      });

      for (const event of upcomingEvents) {
        await sendWebPushNotification(ctx.user.id, {
          title: `🔔 Evento em ${minutesBefore} minutos`,
          body: event.title,
          url: `/calendar?event=${event.id}`,
        });
      }

      return { count: upcomingEvents.length };
    }),

  // Notify goal progress
  notifyGoalProgress: protectedProcedure
    .input(z.object({
      goalId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const goal = await prisma.goals.findFirst({
        where: { id: input.goalId, userId: ctx.user.id },
      });

      if (!goal) {
        throw new Error('Objetivo não encontrado');
      }

      const progress = (goal.currentValue / goal.targetValue) * 100;
      let message = '';

      if (progress >= 100) {
        message = `🎉 Parabéns! Completaste o objetivo "${goal.title}"!`;
      } else if (progress >= 75) {
        message = `🔥 Quase lá! ${Math.round(progress)}% do objetivo "${goal.title}" concluído!`;
      } else if (progress >= 50) {
        message = `💪 Metade do caminho! ${Math.round(progress)}% do objetivo "${goal.title}"`;
      } else if (progress >= 25) {
        message = `📈 Bom progresso! ${Math.round(progress)}% do objetivo "${goal.title}"`;
      }

      if (message) {
        await sendWebPushNotification(ctx.user.id, {
          title: 'Progresso de Objetivo',
          body: message,
          url: `/goals/${goal.id}`,
        });
      }

      return { success: true, progress: Math.round(progress) };
    }),

  // Notify streak milestone
  notifyStreakMilestone: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await prisma.users.findUnique({
      where: { id: ctx.user.id },
      select: { streak: true },
    });

    const streak = user?.streak || 0;

    // Notify on milestones: 7, 14, 30, 60, 90, 180, 365 days
    const milestones = [7, 14, 30, 60, 90, 180, 365];
    
    if (milestones.includes(streak)) {
      await sendWebPushNotification(ctx.user.id, {
        title: '🔥 Streak Milestone!',
        body: `Incrível! ${streak} dias consecutivos de produtividade!`,
        url: '/dashboard',
      });

      return { success: true, streak };
    }

    return { success: false, streak };
  }),

  // Get notification preferences
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    // TODO: Create preferences table
    // For now, return default preferences
    return {
      pushEnabled: true,
      emailEnabled: true,
      taskReminders: true,
      eventReminders: true,
      dailySummary: true,
      weeklyReport: true,
      goalUpdates: true,
      streakReminders: true,
    };
  }),

  // Update notification preferences
  updatePreferences: protectedProcedure
    .input(z.object({
      pushEnabled: z.boolean().optional(),
      emailEnabled: z.boolean().optional(),
      taskReminders: z.boolean().optional(),
      eventReminders: z.boolean().optional(),
      dailySummary: z.boolean().optional(),
      weeklyReport: z.boolean().optional(),
      goalUpdates: z.boolean().optional(),
      streakReminders: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Save to preferences table
      console.log(`[Preferences Updated] User ${ctx.user.id}:`, input);
      
      return { success: true, preferences: input };
    }),
});
