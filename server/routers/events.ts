import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import prisma from "../db";
import { Prisma } from "@prisma/client";

// Event schemas
export const createEventSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string().optional(),
  category: z.enum(['work', 'personal', 'health', 'finance', 'other']).optional(),
  color: z.string().optional(),
  isAllDay: z.boolean().optional(),
  recurrence: z.string().optional(),
  reminders: z.array(z.number()).optional(),
  attendees: z.array(z.string()).optional(),
});

export const updateEventSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  category: z.enum(['work', 'personal', 'health', 'finance', 'other']).optional(),
  color: z.string().optional(),
});

export const listEventsSchema = z.object({
  // Filters
  category: z.enum(['work', 'personal', 'health', 'finance', 'other']).optional(),
  
  // Search
  search: z.string().optional(),
  
  // Date range filters
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  
  // View type
  view: z.enum(['month', 'week', 'day', 'agenda']).optional(),
  
  // Sorting
  sortBy: z.enum(['startTime', 'endTime', 'title', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  
  // Pagination
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export const eventsRouter = router({
  // List events with advanced filters, search, and pagination
  list: protectedProcedure
    .input(listEventsSchema.optional())
    .query(async ({ ctx, input }) => {
      const {
        category,
        search,
        startDate,
        endDate,
        view = 'month',
        sortBy = 'startTime',
        sortOrder = 'asc',
        page = 1,
        limit = 100,
      } = input || {};

      // Calculate date range based on view
      let dateFrom = startDate ? new Date(startDate) : new Date();
      let dateTo = endDate ? new Date(endDate) : new Date();

      if (!startDate && !endDate) {
        const now = new Date();
        switch (view) {
          case 'day':
            dateFrom = new Date(now.setHours(0, 0, 0, 0));
            dateTo = new Date(now.setHours(23, 59, 59, 999));
            break;
          case 'week':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            dateFrom = new Date(weekStart.setHours(0, 0, 0, 0));
            dateTo = new Date(weekStart);
            dateTo.setDate(dateFrom.getDate() + 6);
            dateTo.setHours(23, 59, 59, 999);
            break;
          case 'month':
            dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
            dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            break;
          case 'agenda':
            dateFrom = new Date(now.setHours(0, 0, 0, 0));
            dateTo = new Date(now);
            dateTo.setMonth(dateTo.getMonth() + 3);
            break;
        }
      }

      // Build where clause
      const where: Prisma.eventsWhereInput = {
        userId: ctx.user.id,
        ...(category && { category }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
          ],
        }),
        startTime: { gte: dateFrom, lte: dateTo },
      };

      // Build orderBy clause
      const orderBy: Prisma.eventsOrderByWithRelationInput = {
        [sortBy]: sortOrder,
      };

      // Execute query with pagination
      const [events, total] = await Promise.all([
        prisma.events.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.events.count({ where }),
      ]);

      return {
        events,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get single event by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await prisma.events.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      
      if (!event) {
        throw new Error('Evento não encontrado');
      }
      
      return event;
    }),

  // Create new event
  create: protectedProcedure
    .input(createEventSchema)
    .mutation(async ({ ctx, input }) => {
      const { reminders, attendees, ...eventData } = input;
      
      const event = await prisma.events.create({
        data: {
          id: crypto.randomUUID(),
          userId: ctx.user.id,
          title: eventData.title,
          description: eventData.description,
          startTime: new Date(eventData.startTime),
          endTime: new Date(eventData.endTime),
          location: eventData.location,
          category: eventData.category || 'other',
          color: eventData.color,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Award XP for creating event
      await prisma.users.update({
        where: { id: ctx.user.id },
        data: { xp: { increment: 5 } },
      });

      return event;
    }),

  // Update existing event
  update: protectedProcedure
    .input(updateEventSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      // Verify ownership
      const existing = await prisma.events.findFirst({
        where: { id, userId: ctx.user.id },
      });
      
      if (!existing) {
        throw new Error('Evento não encontrado');
      }

      const event = await prisma.events.update({
        where: { id },
        data: {
          ...data,
          startTime: data.startTime ? new Date(data.startTime) : undefined,
          endTime: data.endTime ? new Date(data.endTime) : undefined,
          updatedAt: new Date(),
        },
      });

      return event;
    }),

  // Delete event
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await prisma.events.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      
      if (!existing) {
        throw new Error('Evento não encontrado');
      }

      await prisma.events.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get upcoming events
  upcoming: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const limit = input?.limit || 5;
      
      return await prisma.events.findMany({
        where: {
          userId: ctx.user.id,
          startTime: { gte: new Date() },
        },
        orderBy: { startTime: 'asc' },
        take: limit,
      });
    }),

  // Get events for today
  today: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    return await prisma.events.findMany({
      where: {
        userId: ctx.user.id,
        startTime: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { startTime: 'asc' },
    });
  }),

  // Bulk operations
  bulkDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const result = await prisma.events.deleteMany({
        where: {
          id: { in: input.ids },
          userId: ctx.user.id,
        },
      });

      return { deleted: result.count };
    }),

  // Statistics
  stats: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [total, thisMonth, byCategory, upcoming] = await Promise.all([
      prisma.events.count({ where: { userId: ctx.user.id } }),
      
      prisma.events.count({
        where: {
          userId: ctx.user.id,
          startTime: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      
      prisma.events.groupBy({
        by: ['category'],
        where: {
          userId: ctx.user.id,
          startTime: { gte: now },
        },
        _count: true,
      }),
      
      prisma.events.count({
        where: {
          userId: ctx.user.id,
          startTime: { gte: now },
        },
      }),
    ]);

    return {
      total,
      thisMonth,
      byCategory: Object.fromEntries(byCategory.map(c => [c.category, c._count])),
      upcoming,
    };
  }),

  // Check for conflicts
  checkConflicts: protectedProcedure
    .input(z.object({
      startTime: z.string(),
      endTime: z.string(),
      excludeId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const conflicts = await prisma.events.findMany({
        where: {
          userId: ctx.user.id,
          id: input.excludeId ? { not: input.excludeId } : undefined,
          OR: [
            {
              startTime: {
                gte: new Date(input.startTime),
                lt: new Date(input.endTime),
              },
            },
            {
              endTime: {
                gt: new Date(input.startTime),
                lte: new Date(input.endTime),
              },
            },
            {
              AND: [
                { startTime: { lte: new Date(input.startTime) } },
                { endTime: { gte: new Date(input.endTime) } },
              ],
            },
          ],
        },
      });

      return { hasConflicts: conflicts.length > 0, conflicts };
    }),
});
