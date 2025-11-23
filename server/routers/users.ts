import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import prisma from "../db";

export const usersRouter = router({
    updateProfile: protectedProcedure
        .input(z.object({
            name: z.string().optional(),
            bio: z.string().optional(),
            avatar: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            return await prisma.users.update({
                where: { id: ctx.user.id },
                data: input,
            });
        }),

    completeOnboarding: protectedProcedure
        .mutation(async ({ ctx }) => {
            return await prisma.users.update({
                where: { id: ctx.user.id },
                data: { completedOnboarding: true },
            });
        }),
});
