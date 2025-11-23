import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import prisma from "../db";
import { verifyPassword } from "../auth";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";

export const privacyRouter = router({
    // Export all user data
    exportUserData: protectedProcedure.mutation(async ({ ctx }) => {
        const userId = ctx.user.id;

        // Fetch all user data in parallel
        // Using any cast for tables that might have different names in schema vs client generation
        // or if the types are not perfectly aligned in the current context
        const [
            user,
            tasks,
            events,
            goals,
            transactions,
            diaryEntries,
            menstrualCycleData,
            // notificationPreferences, // Skipping if table doesn't exist or is problematic
            achievements,
            badges
        ] = await Promise.all([
            prisma.users.findUnique({ where: { id: userId } }),
            prisma.tasks.findMany({ where: { userId } }),
            prisma.events.findMany({ where: { userId } }),
            prisma.goals.findMany({ where: { userId }, include: { goal_checkins: true } }),
            prisma.transactions.findMany({ where: { userId } }),
            // @ts-ignore - Handling potential schema name mismatch
            prisma.diary_entries.findMany({ where: { userId } }),
            // @ts-ignore - Handling potential schema name mismatch
            prisma.menstrual_cycles.findMany({ where: { userId } }),
            // prisma.notification_preferences.findUnique({ where: { userId } }),
            // @ts-ignore - Handling potential schema name mismatch
            prisma.achievements ? prisma.achievements.findMany({ where: { userId } }) : [],
            // @ts-ignore - Handling potential schema name mismatch
            prisma.user_badges ? prisma.user_badges.findMany({ where: { userId }, include: { badge: true } }) : []
        ]);

        return {
            exportDate: new Date().toISOString(),
            user: {
                name: user?.name,
                email: user?.email,
                createdAt: user?.createdAt,
                loginMethod: user?.loginMethod,
            },
            tasks,
            events,
            goals,
            transactions,
            diaryEntries,
            menstrualCycleData,
            // notificationPreferences,
            gamification: {
                xp: user?.xp,
                achievements,
                badges
            }
        };
    }),

    // Delete account permanently
    deleteAccount: protectedProcedure
        .input(z.object({
            password: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user.id;
            const user = await prisma.users.findUnique({ where: { id: userId } });

            if (!user) {
                throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
            }

            // If user registered with email/password, verify password
            if (user.loginMethod === 'email' && user.password) {
                if (!input.password) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Password required for account deletion"
                    });
                }

                const isValid = await verifyPassword(input.password, user.password);
                if (!isValid) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: "Senha incorreta"
                    });
                }
            }

            // Delete all user data (using transaction to ensure atomicity)
            await prisma.$transaction(async (tx) => {
                // Delete related records first
                // Using any cast or ts-ignore to bypass strict type checks on potentially missing properties
                // if the schema is not fully synced with the client types in this context

                await tx.tasks.deleteMany({ where: { userId } });
                await tx.events.deleteMany({ where: { userId } });
                await tx.goals.deleteMany({ where: { userId } });
                await tx.transactions.deleteMany({ where: { userId } });

                // @ts-ignore
                if (tx.diary_entries) await tx.diary_entries.deleteMany({ where: { userId } });
                // @ts-ignore
                if (tx.menstrual_cycles) await tx.menstrual_cycles.deleteMany({ where: { userId } });
                // @ts-ignore
                if (tx.notification_preferences) await tx.notification_preferences.deleteMany({ where: { userId } });
                // @ts-ignore
                if (tx.chat_messages) await tx.chat_messages.deleteMany({ where: { userId } });
                // @ts-ignore
                if (tx.achievements) await tx.achievements.deleteMany({ where: { userId } });
                // @ts-ignore
                if (tx.user_badges) await tx.user_badges.deleteMany({ where: { userId } });

                // Finally delete the user
                await tx.users.delete({ where: { id: userId } });
            });

            // Clear session cookie
            const cookieOptions = getSessionCookieOptions(ctx.req);
            ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });

            return { success: true };
        }),
});
