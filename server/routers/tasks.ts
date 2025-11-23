import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import prisma from "../db";
import { Prisma } from "@prisma/client";

// Task schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done', 'archived']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.enum(['work', 'personal', 'health', 'finance', 'other']).optional(),
  dueDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  estimatedTime: z.number().optional(),
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
});

export const updateTaskSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done', 'archived']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.enum(['work', 'personal', 'health', 'finance', 'other']).optional(),
  dueDate: z.string().nullable().optional(),
  scheduledTime: z.string().nullable().optional(),
  estimatedTime: z.number().nullable().optional(),
  completedAt: z.string().nullable().optional(),
});

export const listTasksSchema = z.object({
  // Filters
  status: z.enum(['todo', 'in_progress', 'done', 'archived']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.enum(['work', 'personal', 'health', 'finance', 'other']).optional(),
  
  // Search
  search: z.string().optional(),
  
  // Date filters
  dueDateFrom: z.string().optional(),
  dueDateTo: z.string().optional(),
  createdAfter: z.string().optional(),
  createdBefore: z.string().optional(),
  
  // Sorting
  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'title', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  
  // Pagination
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export const tasksRouter = router({
  // List tasks with advanced filters, search, and pagination
  list: protectedProcedure
    .input(listTasksSchema.optional())
    .query(async ({ ctx, input }) => {
      const {
        status,
        priority,
        category,
        search,
        dueDateFrom,
        dueDateTo,
        createdAfter,
        createdBefore,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 50,
      } = input || {};

      // Build where clause
      const where: Prisma.tasksWhereInput = {
        userId: ctx.user.id,
        ...(status && { status }),
        ...(priority && { priority }),
        ...(category && { category }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(dueDateFrom && { dueDate: { gte: new Date(dueDateFrom) } }),
        ...(dueDateTo && { dueDate: { lte: new Date(dueDateTo) } }),
        ...(createdAfter && { createdAt: { gte: new Date(createdAfter) } }),
        ...(createdBefore && { createdAt: { lte: new Date(createdBefore) } }),
      };

      // Build orderBy clause
      const orderBy: Prisma.tasksOrderByWithRelationInput = {
        [sortBy]: sortOrder,
      };

      // Execute query with pagination
      const [tasks, total] = await Promise.all([
        prisma.tasks.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.tasks.count({ where }),
      ]);

      return {
        tasks,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get single task by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const task = await prisma.tasks.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      
      if (!task) {
        throw new Error('Tarefa não encontrada');
      }
      
      return task;
    }),

  // Create new task
  create: protectedProcedure
    .input(createTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const { tags, attachments, ...taskData } = input;
      console.log('[DEBUG] Creating task for userId:', ctx.user.id);
      
      const task = await prisma.tasks.create({
        data: {
          id: crypto.randomUUID(),
          userId: ctx.user.id,
          title: taskData.title,
          description: taskData.description,
          status: taskData.status || 'todo',
          priority: taskData.priority || 'medium',
          category: taskData.category || 'other',
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
          scheduledTime: taskData.scheduledTime,
          estimatedTime: taskData.estimatedTime,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Award XP for creating task
      await prisma.users.update({
        where: { id: ctx.user.id },
        data: { xp: { increment: 10 } },
      });

      return task;
    }),

  // Update existing task
  update: protectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      // Verify ownership
      const existing = await prisma.tasks.findFirst({
        where: { id, userId: ctx.user.id },
      });
      
      if (!existing) {
        throw new Error('Tarefa não encontrada');
      }

      // Check if task is being completed
      const isCompleting = data.status === 'done' && existing.status !== 'done';
      
      const task = await prisma.tasks.update({
        where: { id },
        data: {
          ...data,
          dueDate: data.dueDate !== undefined 
            ? (data.dueDate ? new Date(data.dueDate) : null)
            : undefined,
          completedAt: isCompleting ? new Date() : data.completedAt ? new Date(data.completedAt) : undefined,
          updatedAt: new Date(),
        },
      });

      // Award XP for completing task
      if (isCompleting) {
        const xpReward = existing.priority === 'high' ? 50 : existing.priority === 'medium' ? 30 : 20;
        await prisma.users.update({
          where: { id: ctx.user.id },
          data: { 
            xp: { increment: xpReward },
            lastActivityDate: new Date(),
          },
        });
      }

      return task;
    }),

  // Delete task
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await prisma.tasks.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      
      if (!existing) {
        throw new Error('Tarefa não encontrada');
      }

      await prisma.tasks.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Toggle task status (quick action)
  toggleStatus: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const task = await prisma.tasks.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      
      if (!task) {
        throw new Error('Tarefa não encontrada');
      }

      const newStatus = task.status === 'done' ? 'todo' : 'done';
      const isCompleting = newStatus === 'done';

      const updated = await prisma.tasks.update({
        where: { id: input.id },
        data: { 
          status: newStatus,
          completedAt: isCompleting ? new Date() : null,
          updatedAt: new Date(),
        },
      });

      // Award XP for completing
      if (isCompleting) {
        const xpReward = task.priority === 'high' ? 50 : task.priority === 'medium' ? 30 : 20;
        await prisma.users.update({
          where: { id: ctx.user.id },
          data: { 
            xp: { increment: xpReward },
            lastActivityDate: new Date(),
          },
        });
      }

      return updated;
    }),

  // Bulk operations
  bulkDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const result = await prisma.tasks.deleteMany({
        where: {
          id: { in: input.ids },
          userId: ctx.user.id,
        },
      });

      return { deleted: result.count };
    }),

  bulkUpdateStatus: protectedProcedure
    .input(z.object({
      ids: z.array(z.string()),
      status: z.enum(['todo', 'in_progress', 'done', 'archived']),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await prisma.tasks.updateMany({
        where: {
          id: { in: input.ids },
          userId: ctx.user.id,
        },
        data: {
          status: input.status,
          completedAt: input.status === 'done' ? new Date() : null,
          updatedAt: new Date(),
        },
      });

      return { updated: result.count };
    }),

  // Statistics
  stats: protectedProcedure.query(async ({ ctx }) => {
    const [total, byStatus, byPriority, byCategory, completedToday, overdue] = await Promise.all([
      prisma.tasks.count({ where: { userId: ctx.user.id } }),
      
      prisma.tasks.groupBy({
        by: ['status'],
        where: { userId: ctx.user.id },
        _count: true,
      }),
      
      prisma.tasks.groupBy({
        by: ['priority'],
        where: { userId: ctx.user.id, status: { not: 'done' } },
        _count: true,
      }),
      
      prisma.tasks.groupBy({
        by: ['category'],
        where: { userId: ctx.user.id, status: { not: 'done' } },
        _count: true,
      }),
      
      prisma.tasks.count({
        where: {
          userId: ctx.user.id,
          status: 'done',
          completedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      
      prisma.tasks.count({
        where: {
          userId: ctx.user.id,
          status: { not: 'done' },
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    return {
      total,
      byStatus: Object.fromEntries(byStatus.map(s => [s.status, s._count])),
      byPriority: Object.fromEntries(byPriority.map(p => [p.priority, p._count])),
      byCategory: Object.fromEntries(byCategory.map(c => [c.category, c._count])),
      completedToday,
      overdue,
    };
  }),
});
