import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import prisma from "../db";

// Helper function to calculate cycle predictions
function calculatePredictions(cycles: any[]) {
  if (cycles.length === 0) {
    return {
      nextPeriod: "Sem dados",
      nextPeriodDate: null,
      averageCycleLength: 28,
      avgCycleLength: 28,
      averagePeriodLength: 5,
      fertileWindow: null,
      currentPhase: "Sem dados",
      fertility: "Sem dados",
      daysUntilNextPeriod: 0,
    };
  }

  // Calculate averages
  const completedCycles = cycles.filter(c => c.endDate && c.cycleLength);
  const avgCycleLength = completedCycles.length > 0
    ? Math.round(completedCycles.reduce((sum, c) => sum + c.cycleLength, 0) / completedCycles.length)
    : 28;
  
  const avgPeriodLength = completedCycles.length > 0
    ? Math.round(completedCycles.reduce((sum, c) => sum + (c.periodLength || 5), 0) / completedCycles.length)
    : 5;

  // Get last cycle
  const lastCycle = cycles[0];
  const lastStartDate = new Date(lastCycle.startDate);
  
  // Predict next period
  const nextPeriodDate = new Date(lastStartDate);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + avgCycleLength);
  
  // Calculate fertile window (ovulation around day 14)
  const ovulationDate = new Date(lastStartDate);
  ovulationDate.setDate(ovulationDate.getDate() + 14);
  
  const fertileStart = new Date(ovulationDate);
  fertileStart.setDate(fertileStart.getDate() - 5);
  
  const fertileEnd = new Date(ovulationDate);
  fertileEnd.setDate(fertileEnd.getDate() + 1);

  // Determine current phase
  const today = new Date();
  const daysSinceStart = Math.floor((today.getTime() - lastStartDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let currentPhase = "follicular";
  let fertility = "low";
  
  if (daysSinceStart <= avgPeriodLength) {
    currentPhase = "menstrual";
    fertility = "very_low";
  } else if (daysSinceStart > avgPeriodLength && daysSinceStart <= 13) {
    currentPhase = "follicular";
    fertility = "low";
  } else if (daysSinceStart >= 13 && daysSinceStart <= 16) {
    currentPhase = "ovulation";
    fertility = "high";
  } else {
    currentPhase = "luteal";
    fertility = "medium";
  }

  // Format dates as strings for React compatibility
  const daysUntil = Math.ceil((nextPeriodDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    nextPeriod: daysUntil > 0 ? `${daysUntil} dias` : "Hoje",
    nextPeriodDate: nextPeriodDate.toISOString(),
    averageCycleLength: avgCycleLength,
    avgCycleLength: avgCycleLength,
    averagePeriodLength: avgPeriodLength,
    fertileWindow: {
      start: fertileStart.toISOString(),
      end: fertileEnd.toISOString(),
      ovulation: ovulationDate.toISOString(),
    },
    currentPhase,
    fertility,
    daysUntilNextPeriod: daysUntil,
  };
}

export const menstrualRouter = router({
  // List all cycles with predictions
  list: protectedProcedure.query(async ({ ctx }) => {
    const cycles = await prisma.menstrual_cycles.findMany({
      where: { userId: ctx.user.id },
      orderBy: { startDate: 'desc' },
    });

    const predictions = calculatePredictions(cycles);

    return {
      cycles,
      predictions,
      stats: {
        totalCycles: cycles.length,
        averageCycleLength: predictions.averageCycleLength,
        averagePeriodLength: predictions.averagePeriodLength,
      },
    };
  }),

  // Get predictions and insights
  predictions: protectedProcedure.query(async ({ ctx }) => {
    const cycles = await prisma.menstrual_cycles.findMany({
      where: { userId: ctx.user.id },
      orderBy: { startDate: 'desc' },
      take: 12, // Last 12 cycles for accurate predictions
    });

    const predictions = calculatePredictions(cycles);
    
    // Calculate symptom patterns
    const allSymptoms = cycles.flatMap(c => c.symptoms);
    const symptomCounts: Record<string, number> = {};
    allSymptoms.forEach(symptom => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
    
    const commonSymptoms = Object.entries(symptomCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([symptom, count]) => ({
        symptom,
        frequency: Math.round((count / cycles.length) * 100),
      }));

    // Calculate mood patterns
    const moodCounts: Record<string, number> = {};
    cycles.forEach(c => {
      if (c.mood) {
        moodCounts[c.mood] = (moodCounts[c.mood] || 0) + 1;
      }
    });
    
    const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      percentage: Math.round((count / cycles.length) * 100),
    }));

    return {
      ...predictions,
      insights: {
        commonSymptoms,
        moodDistribution,
        cycleRegularity: cycles.length >= 3 ? 
          (Math.abs(predictions.averageCycleLength - 28) <= 3 ? "regular" : "irregular") : 
          "insufficient_data",
        predictionAccuracy: cycles.length >= 6 ? 95 : cycles.length >= 3 ? 80 : 60,
      },
    };
  }),

  // Create new cycle
  create: protectedProcedure
    .input(z.object({
      startDate: z.string().or(z.date()),
      endDate: z.string().or(z.date()).optional(),
      periodLength: z.number().min(1).max(15).optional(),
      flow: z.enum(['light', 'medium', 'heavy']).optional(),
      symptoms: z.array(z.string()).optional(),
      mood: z.enum(['good', 'neutral', 'bad', 'irritable', 'anxious']).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const startDate = new Date(input.startDate);
      const endDate = input.endDate ? new Date(input.endDate) : null;
      
      const cycleLength = endDate ? 
        Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 
        null;

      const cycle = await prisma.menstrual_cycles.create({
        data: {
          id: crypto.randomUUID(),
          userId: ctx.user.id,
          startDate,
          endDate,
          cycleLength,
          periodLength: input.periodLength || null,
          flow: input.flow || null,
          symptoms: input.symptoms || [],
          mood: input.mood || null,
          notes: input.notes || null,
          createdAt: new Date(),
        },
      });

      // Award XP for tracking
      await prisma.users.update({
        where: { id: ctx.user.id },
        data: {
          xp: { increment: 5 },
        },
      });

      return cycle;
    }),

  // Update cycle
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      startDate: z.string().or(z.date()).optional(),
      endDate: z.string().or(z.date()).optional(),
      periodLength: z.number().min(1).max(15).optional(),
      flow: z.enum(['light', 'medium', 'heavy']).optional(),
      symptoms: z.array(z.string()).optional(),
      mood: z.enum(['good', 'neutral', 'bad', 'irritable', 'anxious']).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      const updateData: any = { ...data };
      
      if (data.startDate) {
        updateData.startDate = new Date(data.startDate);
      }
      
      if (data.endDate) {
        updateData.endDate = new Date(data.endDate);
        
        // Recalculate cycle length if both dates present
        const cycle = await prisma.menstrual_cycles.findUnique({
          where: { id },
        });
        
        if (cycle) {
          const start = data.startDate ? new Date(data.startDate) : cycle.startDate;
          const end = new Date(data.endDate);
          updateData.cycleLength = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        }
      }

      return await prisma.menstrual_cycles.update({
        where: { id, userId: ctx.user.id },
        data: updateData,
      });
    }),

  // Delete cycle
  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.menstrual_cycles.delete({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      });
    }),

  // Get calendar data for visualization
  calendar: protectedProcedure
    .input(z.object({
      month: z.number().min(1).max(12),
      year: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const startOfMonth = new Date(input.year, input.month - 1, 1);
      const endOfMonth = new Date(input.year, input.month, 0);

      const cycles = await prisma.menstrual_cycles.findMany({
        where: {
          userId: ctx.user.id,
          startDate: {
            lte: endOfMonth,
          },
          OR: [
            { endDate: { gte: startOfMonth } },
            { endDate: null },
          ],
        },
        orderBy: { startDate: 'desc' },
      });

      // Get predictions for future dates
      const allCycles = await prisma.menstrual_cycles.findMany({
        where: { userId: ctx.user.id },
        orderBy: { startDate: 'desc' },
        take: 12,
      });
      
      const predictions = calculatePredictions(allCycles);

      return {
        cycles,
        predictions,
        month: input.month,
        year: input.year,
      };
    }),
});
