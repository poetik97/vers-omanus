import prisma from '../db';
import { sendEmail } from './email';
import {
    taskReminderTemplate,
    eventReminderTemplate,
    dailySummaryTemplate,
    budgetAlertTemplate,
    diaryReminderTemplate,
    menstrualCycleAlertTemplate,
    goalAchievementTemplate,
    weeklySummaryTemplate,
} from './email-templates';
import { formatDistance, format, startOfDay, endOfDay, startOfWeek, endOfWeek, differenceInDays, addDays } from 'date-fns';
import { pt } from 'date-fns/locale';

/**
 * Check if notification should be sent based on user preferences and quiet hours
 */
async function shouldSendNotification(
    userId: string,
    notificationType: string,
    channel: 'email' | 'push' = 'email'
): Promise<boolean> {
    const prefs = await prisma.notification_preferences.findUnique({
        where: { userId },
    });

    // If no preferences, use defaults (all enabled)
    if (!prefs) return true;

    // Check if channel is enabled
    if (channel === 'email' && !prefs.emailEnabled) return false;
    if (channel === 'push' && !prefs.pushEnabled) return false;

    // Check if notification type is enabled
    const typeEnabled: Record<string, boolean> = {
        taskReminders: prefs.taskReminders,
        eventReminders: prefs.eventReminders,
        goalUpdates: prefs.goalUpdates,
        financialAlerts: prefs.financialAlerts,
        diaryReminders: prefs.diaryReminders,
        menstrualAlerts: prefs.menstrualAlerts,
        dailySummary: prefs.dailySummary,
        weeklySummary: prefs.weeklySummary,
    };

    if (typeEnabled[notificationType] === false) return false;

    // Check quiet hours
    if (prefs.quietHoursStart && prefs.quietHoursEnd) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const [startH, startM] = prefs.quietHoursStart.split(':').map(Number);
        const [endH, endM] = prefs.quietHoursEnd.split(':').map(Number);

        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        // Handle overnight quiet hours (e.g., 22:00 - 08:00)
        if (startMinutes > endMinutes) {
            if (currentTime >= startMinutes || currentTime <= endMinutes) {
                return false; // In quiet hours
            }
        } else {
            if (currentTime >= startMinutes && currentTime <= endMinutes) {
                return false; // In quiet hours
            }
        }
    }

    return true;
}

/**
 * Create notification in database and optionally send email
 */
async function createNotification(
    userId: string,
    data: {
        title: string;
        message: string;
        type: string;
        actionUrl?: string;
        metadata?: any;
    },
    sendEmailNotification: boolean = false,
    emailData?: any
): Promise<void> {
    try {
        // Create in-app notification
        await prisma.notifications.create({
            data: {
                id: crypto.randomUUID(),
                userId,
                title: data.title,
                message: data.message,
                type: data.type,
                actionUrl: data.actionUrl,
                metadata: data.metadata,
                read: false,
                emailSent: false,
                createdAt: new Date(),
            },
        });

        // Send email if requested and user preferences allow
        if (sendEmailNotification && emailData) {
            const shouldSend = await shouldSendNotification(userId, data.type, 'email');

            if (shouldSend) {
                const user = await prisma.users.findUnique({
                    where: { id: userId },
                    select: { email: true, name: true },
                });

                if (user?.email) {
                    const sent = await sendEmail({
                        to: user.email,
                        template: emailData.template,
                    });

                    if (sent) {
                        // Update notification to mark email as sent
                        await prisma.notifications.updateMany({
                            where: {
                                userId,
                                type: data.type,
                                emailSent: false,
                                createdAt: { gte: new Date(Date.now() - 5000) }, // Last 5 seconds
                            },
                            data: {
                                emailSent: true,
                                emailSentAt: new Date(),
                            },
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error('[Notification Scheduler] Error creating notification:', error);
    }
}

// ===========================================
// SCHEDULER 1: Check Overdue Tasks
// ===========================================
export async function checkOverdueTasks(): Promise<number> {
    console.log('[Scheduler] Checking overdue tasks...');

    try {
        const now = new Date();

        // Find all overdue tasks
        const overdueTasks = await prisma.tasks.findMany({
            where: {
                status: { not: 'done' },
                dueDate: { lt: now },
            },
            include: {
                users: { select: { id: true, email: true, name: true } },
            },
        });

        let notificationsSent = 0;

        for (const task of overdueTasks) {
            const shouldSend = await shouldSendNotification(task.userId, 'taskReminders');

            if (!shouldSend) continue;

            const daysOverdue = differenceInDays(now, task.dueDate!);

            await createNotification(
                task.userId,
                {
                    title: '⚠️ Tarefa Atrasada',
                    message: `"${task.title}" está ${daysOverdue} dia${daysOverdue !== 1 ? 's' : ''} atrasada`,
                    type: 'taskReminders',
                    actionUrl: `/tasks/${task.id}`,
                    metadata: { taskId: task.id, daysOverdue },
                },
                true,
                {
                    template: taskReminderTemplate({
                        taskTitle: task.title,
                        taskDescription: task.description || undefined,
                        dueDate: format(task.dueDate!, 'dd/MM/yyyy', { locale: pt }),
                        priority: task.priority,
                        taskUrl: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/tasks/${task.id}`,
                        userName: task.users.name || undefined,
                    }),
                }
            );

            notificationsSent++;
        }

        console.log(`[Scheduler] Sent ${notificationsSent} overdue task notifications`);
        return notificationsSent;
    } catch (error) {
        console.error('[Scheduler] Error in checkOverdueTasks:', error);
        return 0;
    }
}

// ===========================================
// SCHEDULER 2: Check Upcoming Events
// ===========================================
export async function checkUpcomingEvents(minutesBefore: number = 60): Promise<number> {
    console.log(`[Scheduler] Checking events in next ${minutesBefore} minutes...`);

    try {
        const now = new Date();
        const futureTime = new Date(now.getTime() + minutesBefore * 60 * 1000);

        const upcomingEvents = await prisma.events.findMany({
            where: {
                startTime: {
                    gte: now,
                    lte: futureTime,
                },
            },
            include: {
                users: { select: { id: true, email: true, name: true } },
            },
        });

        let notificationsSent = 0;

        for (const event of upcomingEvents) {
            const shouldSend = await shouldSendNotification(event.userId, 'eventReminders');

            if (!shouldSend) continue;

            const minutesUntil = Math.round((event.startTime.getTime() - now.getTime()) / 60000);

            await createNotification(
                event.userId,
                {
                    title: `🔔 Evento em ${minutesUntil} minutos`,
                    message: event.title,
                    type: 'eventReminders',
                    actionUrl: `/calendar?event=${event.id}`,
                    metadata: { eventId: event.id, minutesUntil },
                },
                true,
                {
                    template: eventReminderTemplate({
                        eventTitle: event.title,
                        eventDescription: event.description || undefined,
                        startTime: format(event.startTime, "HH:mm 'de' dd/MM/yyyy", { locale: pt }),
                        location: event.location || undefined,
                        eventUrl: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/calendar?event=${event.id}`,
                        userName: event.users.name || undefined,
                    }),
                }
            );

            notificationsSent++;
        }

        console.log(`[Scheduler] Sent ${notificationsSent} upcoming event notifications`);
        return notificationsSent;
    } catch (error) {
        console.error('[Scheduler] Error in checkUpcomingEvents:', error);
        return 0;
    }
}

// ===========================================
// SCHEDULER 3: Send Daily Summaries
// ===========================================
export async function sendDailySummaries(): Promise<number> {
    console.log('[Scheduler] Sending daily summaries...');

    try {
        // Get all users with daily summary enabled
        const users = await prisma.users.findMany({
            where: {
                email: { not: null },
                notification_preferences: {
                    dailySummary: true,
                    emailEnabled: true,
                },
            },
            include: {
                notification_preferences: true,
            },
        });

        let summariesSent = 0;

        for (const user of users) {
            const now = new Date();
            const today = startOfDay(now);
            const endToday = endOfDay(now);

            // Get today's statistics
            const [tasksDueToday, eventsToday, completedYesterday] = await Promise.all([
                prisma.tasks.count({
                    where: {
                        userId: user.id,
                        dueDate: { gte: today, lte: endToday },
                        status: { not: 'done' },
                    },
                }),
                prisma.events.count({
                    where: {
                        userId: user.id,
                        startTime: { gte: today, lte: endToday },
                    },
                }),
                prisma.tasks.count({
                    where: {
                        userId: user.id,
                        completedAt: {
                            gte: startOfDay(addDays(now, -1)),
                            lt: today,
                        },
                    },
                }),
            ]);

            if (!user.email) continue;

            const sent = await sendEmail({
                to: user.email,
                template: dailySummaryTemplate({
                    date: format(today, "dd 'de' MMMM", { locale: pt }),
                    tasksCount: tasksDueToday,
                    eventsCount: eventsToday,
                    completedTasksCount: completedYesterday,
                    userName: user.name || undefined,
                    dashboardUrl: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/dashboard`,
                }),
            });

            if (sent) {
                await createNotification(
                    user.id,
                    {
                        title: '📊 Resumo Diário',
                        message: `${tasksDueToday} tarefas e ${eventsToday} eventos para hoje`,
                        type: 'dailySummary',
                        actionUrl: '/dashboard',
                    },
                    false
                );
                summariesSent++;
            }
        }

        console.log(`[Scheduler] Sent ${summariesSent} daily summaries`);
        return summariesSent;
    } catch (error) {
        console.error('[Scheduler] Error in sendDailySummaries:', error);
        return 0;
    }
}

// ===========================================
// SCHEDULER 4: Check Budget Alerts
// ===========================================
export async function checkBudgetAlerts(): Promise<number> {
    console.log('[Scheduler] Checking budget alerts...');

    try {
        const categories = await prisma.financial_categories.findMany({
            where: {
                type: 'expense',
                budget: { not: null },
            },
        });

        let alertsSent = 0;

        for (const category of categories) {
            if (!category.budget) continue;

            // Get current month spending
            const now = new Date();
            const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const transactions = await prisma.transactions.findMany({
                where: {
                    category: category.name,
                    type: 'expense',
                    date: { gte: startMonth },
                },
                include: {
                    users: { select: { id: true, email: true, name: true } },
                },
            });

            // Group by user
            const userSpending: Record<string, { total: number; user: any }> = {};

            for (const tx of transactions) {
                if (!userSpending[tx.userId]) {
                    userSpending[tx.userId] = { total: 0, user: tx.users };
                }
                userSpending[tx.userId].total += tx.amount;
            }

            // Check each user
            for (const [userId, data] of Object.entries(userSpending)) {
                const percentage = (data.total / category.budget) * 100;

                // Alert if over 90% or over budget
                if (percentage >= 90) {
                    const shouldSend = await shouldSendNotification(userId, 'financialAlerts');

                    if (!shouldSend) continue;

                    await createNotification(
                        userId,
                        {
                            title: percentage > 100 ? '⚠️ Orçamento Excedido' : '💰 Alerta de Orçamento',
                            message: `${category.name}: €${data.total.toFixed(2)} de €${category.budget.toFixed(2)} (${percentage.toFixed(0)}%)`,
                            type: 'financialAlerts',
                            actionUrl: '/finances',
                            metadata: { category: category.name, spent: data.total, budget: category.budget, percentage },
                        },
                        true,
                        {
                            template: budgetAlertTemplate({
                                category: category.name,
                                spent: data.total,
                                budget: category.budget,
                                percentage,
                                financeUrl: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/finances`,
                                userName: data.user.name || undefined,
                            }),
                        }
                    );

                    alertsSent++;
                }
            }
        }

        console.log(`[Scheduler] Sent ${alertsSent} budget alerts`);
        return alertsSent;
    } catch (error) {
        console.error('[Scheduler] Error in checkBudgetAlerts:', error);
        return 0;
    }
}

// ===========================================
// SCHEDULER 5: Send Diary Reminders
// ===========================================
export async function sendDiaryReminders(): Promise<number> {
    console.log('[Scheduler] Sending diary reminders...');

    try {
        const users = await prisma.users.findMany({
            where: {
                email: { not: null },
                notification_preferences: {
                    diaryReminders: true,
                    emailEnabled: true,
                },
            },
            include: {
                diary_entries: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });

        let remindersSent = 0;

        for (const user of users) {
            const lastEntry = user.diary_entries[0];
            const daysSinceLastEntry = lastEntry
                ? differenceInDays(new Date(), lastEntry.createdAt)
                : 999;

            // Send reminder if no entry today or yesterday
            if (daysSinceLastEntry >= 1 && user.email) {
                const shouldSend = await shouldSendNotification(user.id, 'diaryReminders');

                if (!shouldSend) continue;

                const sent = await sendEmail({
                    to: user.email,
                    template: diaryReminderTemplate({
                        lastEntryDate: lastEntry
                            ? formatDistance(lastEntry.createdAt, new Date(), { addSuffix: true, locale: pt })
                            : undefined,
                        diaryUrl: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/diary`,
                        userName: user.name || undefined,
                    }),
                });

                if (sent) {
                    await createNotification(
                        user.id,
                        {
                            title: '📖 Lembrete de Diário',
                            message: 'Escreve sobre o teu dia',
                            type: 'diaryReminders',
                            actionUrl: '/diary',
                        },
                        false
                    );
                    remindersSent++;
                }
            }
        }

        console.log(`[Scheduler] Sent ${remindersSent} diary reminders`);
        return remindersSent;
    } catch (error) {
        console.error('[Scheduler] Error in sendDiaryReminders:', error);
        return 0;
    }
}

// ===========================================
// SCHEDULER 6: Check Menstrual Cycle Predictions
// ===========================================
export async function checkMenstrualPredictions(): Promise<number> {
    console.log('[Scheduler] Checking menstrual cycle predictions...');

    try {
        const users = await prisma.users.findMany({
            where: {
                email: { not: null },
                notification_preferences: {
                    menstrualAlerts: true,
                    emailEnabled: true,
                },
                menstrual_cycles: {
                    some: {},
                },
            },
            include: {
                menstrual_cycles: {
                    orderBy: { startDate: 'desc' },
                    take: 3,
                },
            },
        });

        let alertsSent = 0;

        for (const user of users) {
            if (user.menstrual_cycles.length === 0) continue;

            // Calculate average cycle length
            const lastCycles = user.menstrual_cycles;
            const avgCycleLength = lastCycles.reduce((sum, cycle) =>
                sum + (cycle.cycleLength || 28), 0
            ) / lastCycles.length;

            // Predict next cycle
            const lastCycle = lastCycles[0];
            const predictedNextStart = addDays(lastCycle.startDate, Math.round(avgCycleLength));
            const daysUntil = differenceInDays(predictedNextStart, new Date());

            // Alert 2 days before predicted start
            if (daysUntil === 2 && user.email) {
                const shouldSend = await shouldSendNotification(user.id, 'menstrualAlerts');

                if (!shouldSend) continue;

                const sent = await sendEmail({
                    to: user.email,
                    template: menstrualCycleAlertTemplate({
                        phase: 'próximo ciclo',
                        daysUntil: daysUntil,
                        cycleUrl: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/menstrual`,
                        userName: user.name || undefined,
                    }),
                });

                if (sent) {
                    await createNotification(
                        user.id,
                        {
                            title: '🔄 Previsão de Ciclo',
                            message: `Próximo ciclo previsto em ${daysUntil} dias`,
                            type: 'menstrualAlerts',
                            actionUrl: '/menstrual',
                            metadata: { predictedDate: predictedNextStart, daysUntil },
                        },
                        false
                    );
                    alertsSent++;
                }
            }
        }

        console.log(`[Scheduler] Sent ${alertsSent} menstrual cycle alerts`);
        return alertsSent;
    } catch (error) {
        console.error('[Scheduler] Error in checkMenstrualPredictions:', error);
        return 0;
    }
}

// ===========================================
// MAIN SCHEDULER - Run all checks
// ===========================================
export async function runAllSchedulers(): Promise<void> {
    console.log('[Scheduler] Starting all notification schedulers...');

    const results = await Promise.allSettled([
        checkOverdueTasks(),
        checkUpcomingEvents(),
        checkBudgetAlerts(),
        sendDiaryReminders(),
        checkMenstrualPredictions(),
    ]);

    console.log('[Scheduler] All schedulers completed:', results);
}
