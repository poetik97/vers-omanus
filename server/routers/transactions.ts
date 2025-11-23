import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import prisma from "../db";
import { Prisma } from "@prisma/client";

// Transaction schemas
export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive("Valor deve ser positivo"),
  category: z.string().min(1, "Categoria é obrigatória"),
  description: z.string().optional(),
  date: z.string().optional(),
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
  })).optional(),
});

export const updateTransactionSchema = z.object({
  id: z.string(),
  type: z.enum(['income', 'expense']).optional(),
  amount: z.number().positive().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
});

export const listTransactionsSchema = z.object({
  // Filters
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().optional(),
  
  // Search
  search: z.string().optional(),
  
  // Date range filters
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  
  // Amount range
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  
  // Sorting
  sortBy: z.enum(['date', 'amount', 'category', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  
  // Pagination
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export const transactionsRouter = router({
  // List transactions with advanced filters, search, and pagination
  list: protectedProcedure
    .input(listTransactionsSchema.optional())
    .query(async ({ ctx, input }) => {
      const {
        type,
        category,
        search,
        dateFrom,
        dateTo,
        minAmount,
        maxAmount,
        sortBy = 'date',
        sortOrder = 'desc',
        page = 1,
        limit = 50,
      } = input || {};

      // Build where clause
      const where: Prisma.transactionsWhereInput = {
        userId: ctx.user.id,
        ...(type && { type }),
        ...(category && { category }),
        ...(search && {
          OR: [
            { description: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(dateFrom && { date: { gte: new Date(dateFrom) } }),
        ...(dateTo && { date: { lte: new Date(dateTo) } }),
        ...(minAmount && { amount: { gte: minAmount } }),
        ...(maxAmount && { amount: { lte: maxAmount } }),
      };

      // Build orderBy clause
      const orderBy: Prisma.transactionsOrderByWithRelationInput = {
        [sortBy]: sortOrder,
      };

      // Execute query with pagination
      const [transactions, total] = await Promise.all([
        prisma.transactions.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.transactions.count({ where }),
      ]);

      return {
        transactions,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  // Get single transaction by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const transaction = await prisma.transactions.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      
      if (!transaction) {
        throw new Error('Transação não encontrada');
      }
      
      return transaction;
    }),

  // Create new transaction
  create: protectedProcedure
    .input(createTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      const { tags, attachments, ...transactionData } = input;
      
      const transaction = await prisma.transactions.create({
        data: {
          id: crypto.randomUUID(),
          userId: ctx.user.id,
          type: transactionData.type,
          amount: transactionData.amount,
          category: transactionData.category,
          description: transactionData.description,
          date: transactionData.date ? new Date(transactionData.date) : new Date(),
          createdAt: new Date(),
        },
      });

      // Award XP for tracking finances
      await prisma.users.update({
        where: { id: ctx.user.id },
        data: { xp: { increment: 5 } },
      });

      return transaction;
    }),

  // Update existing transaction
  update: protectedProcedure
    .input(updateTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      // Verify ownership
      const existing = await prisma.transactions.findFirst({
        where: { id, userId: ctx.user.id },
      });
      
      if (!existing) {
        throw new Error('Transação não encontrada');
      }

      const transaction = await prisma.transactions.update({
        where: { id },
        data: {
          ...data,
          date: data.date ? new Date(data.date) : undefined,
        },
      });

      return transaction;
    }),

  // Delete transaction
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await prisma.transactions.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });
      
      if (!existing) {
        throw new Error('Transação não encontrada');
      }

      await prisma.transactions.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Bulk operations
  bulkDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const result = await prisma.transactions.deleteMany({
        where: {
          id: { in: input.ids },
          userId: ctx.user.id },
      });

      return { deleted: result.count };
    }),

  // Get balance
  balance: protectedProcedure
    .input(z.object({
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: Prisma.transactionsWhereInput = {
        userId: ctx.user.id,
        ...(input?.dateFrom && { date: { gte: new Date(input.dateFrom) } }),
        ...(input?.dateTo && { date: { lte: new Date(input.dateTo) } }),
      };

      const transactions = await prisma.transactions.findMany({
        where,
        select: { type: true, amount: true },
      });

      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        income,
        expenses,
        balance: income - expenses,
        savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
      };
    }),

  // Statistics and analytics
  stats: protectedProcedure
    .input(z.object({
      period: z.enum(['week', 'month', 'year', 'all']).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const period = input?.period || 'month';
      const now = new Date();
      let dateFrom: Date;

      switch (period) {
        case 'week':
          dateFrom = new Date(now);
          dateFrom.setDate(now.getDate() - 7);
          break;
        case 'month':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          dateFrom = new Date(now.getFullYear(), 0, 1);
          break;
        case 'all':
          dateFrom = new Date(0);
          break;
      }

      const where: Prisma.transactionsWhereInput = {
        userId: ctx.user.id,
        date: { gte: dateFrom },
      };

      const [total, byType, byCategory, transactions] = await Promise.all([
        prisma.transactions.count({ where }),
        
        prisma.transactions.groupBy({
          by: ['type'],
          where,
          _sum: { amount: true },
          _count: true,
        }),
        
        prisma.transactions.groupBy({
          by: ['category', 'type'],
          where,
          _sum: { amount: true },
          _count: true,
        }),
        
        prisma.transactions.findMany({
          where,
          select: { type: true, amount: true, date: true },
          orderBy: { date: 'asc' },
        }),
      ]);

      // Calculate totals
      const income = byType.find(t => t.type === 'income')?._sum.amount || 0;
      const expenses = byType.find(t => t.type === 'expense')?._sum.amount || 0;
      const balance = income - expenses;

      // Group by category
      const expensesByCategory = byCategory
        .filter(c => c.type === 'expense')
        .map(c => ({
          category: c.category,
          amount: c._sum.amount || 0,
          count: c._count,
        }))
        .sort((a, b) => b.amount - a.amount);

      const incomeByCategory = byCategory
        .filter(c => c.type === 'income')
        .map(c => ({
          category: c.category,
          amount: c._sum.amount || 0,
          count: c._count,
        }))
        .sort((a, b) => b.amount - a.amount);

      // Calculate daily averages
      const daysDiff = Math.max(1, Math.ceil((now.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24)));
      const avgDailyIncome = income / daysDiff;
      const avgDailyExpenses = expenses / daysDiff;

      // Trend analysis (compare with previous period)
      const previousPeriodStart = new Date(dateFrom);
      previousPeriodStart.setTime(dateFrom.getTime() - (now.getTime() - dateFrom.getTime()));
      
      const previousTransactions = await prisma.transactions.findMany({
        where: {
          userId: ctx.user.id,
          date: { gte: previousPeriodStart, lt: dateFrom },
        },
        select: { type: true, amount: true },
      });

      const previousIncome = previousTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const previousExpenses = previousTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const incomeChange = previousIncome > 0 
        ? ((income - previousIncome) / previousIncome) * 100 
        : 0;

      const expensesChange = previousExpenses > 0 
        ? ((expenses - previousExpenses) / previousExpenses) * 100 
        : 0;

      return {
        total,
        income,
        expenses,
        balance,
        savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
        expensesByCategory,
        incomeByCategory,
        avgDailyIncome,
        avgDailyExpenses,
        trends: {
          incomeChange,
          expensesChange,
        },
        timeline: transactions,
      };
    }),

  // Get top categories
  topCategories: protectedProcedure
    .input(z.object({
      type: z.enum(['income', 'expense']),
      limit: z.number().optional(),
      period: z.enum(['week', 'month', 'year']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { type, limit = 5, period = 'month' } = input;
      const now = new Date();
      let dateFrom: Date;

      switch (period) {
        case 'week':
          dateFrom = new Date(now);
          dateFrom.setDate(now.getDate() - 7);
          break;
        case 'month':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          dateFrom = new Date(now.getFullYear(), 0, 1);
          break;
      }

      const categories = await prisma.transactions.groupBy({
        by: ['category'],
        where: {
          userId: ctx.user.id,
          type,
          date: { gte: dateFrom },
        },
        _sum: { amount: true },
        _count: true,
      });

      return categories
        .map(c => ({
          category: c.category,
          total: c._sum.amount || 0,
          count: c._count,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, limit);
    }),

  // Monthly comparison
  monthlyComparison: protectedProcedure
    .input(z.object({
      months: z.number().min(1).max(12).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const months = input?.months || 6;
      const now = new Date();
      const results = [];

      for (let i = 0; i < months; i++) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

        const transactions = await prisma.transactions.findMany({
          where: {
            userId: ctx.user.id,
            date: {
              gte: monthDate,
              lt: nextMonth,
            },
          },
          select: { type: true, amount: true },
        });

        const income = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const expenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        results.unshift({
          month: monthDate.toISOString().substring(0, 7),
          income,
          expenses,
          balance: income - expenses,
          savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
        });
      }

      return results;
    }),
});
