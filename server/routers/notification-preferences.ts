import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import prisma from "../db";
import { testEmailConfiguration } from "../services/email";

export const notificationPreferencesRouter = router({
    // Get user preferences
    get: protectedProcedure.query(async ({ ctx }) => {
        let prefs = await prisma.notification_preferences.findUnique({
            where: { userId: ctx.user.id },
        });

        // Create default preferences if they don't exist
        if (!prefs) {
            prefs = await prisma.notification_preferences.create({
                data: {
                    id: crypto.randomUUID(),
                    userId: ctx.user.id,
                },
            });
        }

        return prefs;
    }),

    // Update preferences
    update: protectedProcedure
        .input(z.object({
            emailEnabled: z.boolean().optional(),
            pushEnabled: z.boolean().optional(),
            taskReminders: z.boolean().optional(),
            eventReminders: z.boolean().optional(),
            goalUpdates: z.boolean().optional(),
            financialAlerts: z.boolean().optional(),
            diaryReminders: z.boolean().optional(),
            menstrualAlerts: z.boolean().optional(),
            dailySummary: z.boolean().optional(),
            dailySummaryTime: z.string().optional(),
            weeklySummary: z.boolean().optional(),
            monthlySummary: z.boolean().optional(),
            quietHoursStart: z.string().nullable().optional(),
            quietHoursEnd: z.string().nullable().optional(),
            timezone: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Ensure preferences exist
            let prefs = await prisma.notification_preferences.findUnique({
                where: { userId: ctx.user.id },
            });

            if (!prefs) {
                prefs = await prisma.notification_preferences.create({
                    data: {
                        id: crypto.randomUUID(),
                        userId: ctx.user.id,
                        ...input,
                    },
                });
            } else {
                prefs = await prisma.notification_preferences.update({
                    where: { userId: ctx.user.id },
                    data: input,
                });
            }

            return prefs;
        }),

    // Reset to defaults
    resetToDefaults: protectedProcedure.mutation(async ({ ctx }) => {
        const prefs = await prisma.notification_preferences.upsert({
            where: { userId: ctx.user.id },
            update: {
                emailEnabled: true,
                pushEnabled: true,
                taskReminders: true,
                eventReminders: true,
                goalUpdates: true,
                financialAlerts: true,
                diaryReminders: true,
                menstrualAlerts: true,
                dailySummary: true,
                dailySummaryTime: "08:00",
                weeklySummary: true,
                monthlySummary: false,
                quietHoursStart: null,
                quietHoursEnd: null,
                timezone: "Europe/Lisbon",
            },
            create: {
                id: crypto.randomUUID(),
                userId: ctx.user.id,
            },
        });

        return prefs;
    }),

    // Send test email
    sendTestEmail: protectedProcedure.mutation(async ({ ctx }) => {
        const user = await prisma.users.findUnique({
            where: { id: ctx.user.id },
            select: { email: true },
        });

        if (!user?.email) {
            throw new Error('Email não configurado');
        }

        const sent = await testEmailConfiguration(user.email);

        if (!sent) {
            throw new Error('Falha ao enviar email de teste');
        }

        return { success: true, message: `Email de teste enviado para ${user.email}` };
    }),

    // Get notification statistics
    getStats: protectedProcedure.query(async ({ ctx }) => {
        const [total, unread, byType] = await Promise.all([
            prisma.notifications.count({
                where: { userId: ctx.user.id },
            }),
            prisma.notifications.count({
                where: { userId: ctx.user.id, read: false },
            }),
            prisma.notifications.groupBy({
                by: ['type'],
                where: { userId: ctx.user.id },
                _count: { type: true },
            }),
        ]);

        return {
            total,
            unread,
            byType: byType.map(item => ({
                type: item.type,
                count: item._count.type,
            })),
        };
    }),
});
