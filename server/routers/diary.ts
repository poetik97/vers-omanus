import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import prisma from "../db";

// Simple sentiment analysis function
function analyzeSentiment(text: string): { sentiment: string; score: number } {
  const lowerText = text.toLowerCase();
  
  // Positive words
  const positiveWords = [
    'feliz', 'alegre', 'ótimo', 'excelente', 'maravilhoso', 'incrível', 
    'amor', 'amizade', 'sucesso', 'vitória', 'conquista', 'gratidão',
    'paz', 'tranquilo', 'calmo', 'satisfeito', 'contente', 'animado'
  ];
  
  // Negative words
  const negativeWords = [
    'triste', 'deprimido', 'ansioso', 'preocupado', 'medo', 'raiva',
    'frustrado', 'cansado', 'estressado', 'difícil', 'problema', 'dor',
    'sozinho', 'perdido', 'confuso', 'mal', 'horrível', 'péssimo'
  ];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });
  
  const totalWords = positiveCount + negativeCount;
  
  if (totalWords === 0) {
    return { sentiment: 'neutral', score: 0 };
  }
  
  const score = ((positiveCount - negativeCount) / totalWords) * 100;
  
  let sentiment: string;
  if (score > 30) sentiment = 'very_positive';
  else if (score > 10) sentiment = 'positive';
  else if (score < -30) sentiment = 'very_negative';
  else if (score < -10) sentiment = 'negative';
  else sentiment = 'neutral';
  
  return { sentiment, score: Math.round(score) };
}

export const diaryRouter = router({
  // List all diary entries
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).optional(),
      offset: z.number().min(0).optional(),
      search: z.string().optional(),
      mood: z.string().optional(),
      tags: z.array(z.string()).optional(),
      startDate: z.string().or(z.date()).optional(),
      endDate: z.string().or(z.date()).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit || 50;
      const offset = input?.offset || 0;
      
      const where: any = {
        userId: ctx.user.id,
      };
      
      // Search filter
      if (input?.search) {
        where.OR = [
          { title: { contains: input.search, mode: 'insensitive' } },
          { content: { contains: input.search, mode: 'insensitive' } },
        ];
      }
      
      // Mood filter
      if (input?.mood) {
        where.mood = input.mood;
      }
      
      // Tags filter
      if (input?.tags && input.tags.length > 0) {
        where.tags = {
          hasSome: input.tags,
        };
      }
      
      // Date range filter
      if (input?.startDate || input?.endDate) {
        where.createdAt = {};
        if (input.startDate) {
          where.createdAt.gte = new Date(input.startDate);
        }
        if (input.endDate) {
          where.createdAt.lte = new Date(input.endDate);
        }
      }
      
      const [entries, total] = await Promise.all([
        prisma.diary_entries.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.diary_entries.count({ where }),
      ]);
      
      return {
        entries,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    }),

  // Get single entry
  getById: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return await prisma.diary_entries.findUnique({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      });
    }),

  // Create diary entry
  create: protectedProcedure
    .input(z.object({
      title: z.string().optional(),
      content: z.string().min(1),
      mood: z.enum(['very_bad', 'bad', 'neutral', 'good', 'very_good']).optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Analyze sentiment
      const { sentiment, score } = analyzeSentiment(input.content);
      
      const entry = await prisma.diary_entries.create({
        data: {
          id: crypto.randomUUID(),
          userId: ctx.user.id,
          title: input.title || null,
          content: input.content,
          mood: input.mood || null,
          tags: input.tags || [],
          sentiment,
          sentimentScore: score,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      
      // Award XP for journaling
      await prisma.users.update({
        where: { id: ctx.user.id },
        data: {
          xp: { increment: 10 },
        },
      });
      
      return entry;
    }),

  // Update diary entry
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      content: z.string().min(1).optional(),
      mood: z.enum(['very_bad', 'bad', 'neutral', 'good', 'very_good']).optional(),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      const updateData: any = {
        ...data,
        updatedAt: new Date(),
      };
      
      // Re-analyze sentiment if content changed
      if (data.content) {
        const { sentiment, score } = analyzeSentiment(data.content);
        updateData.sentiment = sentiment;
        updateData.sentimentScore = score;
      }
      
      return await prisma.diary_entries.update({
        where: {
          id,
          userId: ctx.user.id,
        },
        data: updateData,
      });
    }),

  // Delete diary entry
  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.diary_entries.delete({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      });
    }),

  // Get statistics
  stats: protectedProcedure.query(async ({ ctx }) => {
    const entries = await prisma.diary_entries.findMany({
      where: { userId: ctx.user.id },
      select: {
        mood: true,
        sentiment: true,
        sentimentScore: true,
        tags: true,
        createdAt: true,
      },
    });
    
    const totalEntries = entries.length;
    
    // Mood distribution
    const moodCounts: Record<string, number> = {};
    entries.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      }
    });
    
    // Sentiment distribution
    const sentimentCounts: Record<string, number> = {};
    entries.forEach(entry => {
      if (entry.sentiment) {
        sentimentCounts[entry.sentiment] = (sentimentCounts[entry.sentiment] || 0) + 1;
      }
    });
    
    // Average sentiment score
    const avgSentimentScore = entries.length > 0
      ? Math.round(entries.reduce((sum, e) => sum + (e.sentimentScore || 0), 0) / entries.length)
      : 0;
    
    // Most used tags
    const allTags = entries.flatMap(e => e.tags);
    const tagCounts: Record<string, number> = {};
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    
    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
    
    // Entries per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentEntries = entries.filter(e => e.createdAt >= sixMonthsAgo);
    const entriesByMonth: Record<string, number> = {};
    
    recentEntries.forEach(entry => {
      const month = entry.createdAt.toISOString().slice(0, 7); // YYYY-MM
      entriesByMonth[month] = (entriesByMonth[month] || 0) + 1;
    });
    
    // Current streak
    const sortedEntries = entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    let currentStreak = 0;
    let lastDate: Date | null = null;
    
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      
      if (!lastDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if last entry was today or yesterday
        const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 1) {
          currentStreak = 1;
          lastDate = entryDate;
        } else {
          break;
        }
      } else {
        const daysDiff = Math.floor((lastDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          currentStreak++;
          lastDate = entryDate;
        } else {
          break;
        }
      }
    }
    
    return {
      totalEntries,
      avgSentimentScore,
      currentStreak,
      moodDistribution: Object.entries(moodCounts).map(([mood, count]) => ({
        mood,
        count,
        percentage: Math.round((count / totalEntries) * 100),
      })),
      sentimentDistribution: Object.entries(sentimentCounts).map(([sentiment, count]) => ({
        sentiment,
        count,
        percentage: Math.round((count / totalEntries) * 100),
      })),
      topTags,
      entriesByMonth: Object.entries(entriesByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({ month, count })),
    };
  }),

  // Get insights (AI-powered suggestions)
  insights: protectedProcedure.query(async ({ ctx }) => {
    const entries = await prisma.diary_entries.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30, // Last 30 entries
    });
    
    if (entries.length === 0) {
      return {
        insights: [
          "Comece a escrever no seu diário para receber insights personalizados!",
        ],
        recommendations: [
          "Escreva pelo menos 3 vezes por semana",
          "Seja honesto sobre seus sentimentos",
          "Use tags para organizar suas entradas",
        ],
      };
    }
    
    const insights: string[] = [];
    const recommendations: string[] = [];
    
    // Analyze sentiment trends
    const avgSentiment = entries.reduce((sum, e) => sum + (e.sentimentScore || 0), 0) / entries.length;
    
    if (avgSentiment > 30) {
      insights.push("Suas entradas recentes mostram um sentimento muito positivo! Continue assim! 🌟");
    } else if (avgSentiment < -30) {
      insights.push("Notamos um sentimento mais negativo nas suas entradas recentes. Considere conversar com alguém de confiança.");
      recommendations.push("Pratique gratidão diária");
      recommendations.push("Identifique padrões que afetam seu humor");
    } else {
      insights.push("Seu humor tem estado equilibrado. Continue registrando seus sentimentos.");
    }
    
    // Analyze frequency
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const entriesLastWeek = entries.filter(e => e.createdAt >= lastWeek);
    
    if (entriesLastWeek.length >= 5) {
      insights.push(`Excelente! Você escreveu ${entriesLastWeek.length} vezes esta semana. 📝`);
    } else if (entriesLastWeek.length === 0) {
      recommendations.push("Tente escrever pelo menos uma vez esta semana");
    }
    
    // Analyze tags
    const allTags = entries.flatMap(e => e.tags);
    const uniqueTags = [...new Set(allTags)];
    
    if (uniqueTags.length > 5) {
      insights.push(`Você usa ${uniqueTags.length} tags diferentes. Isso ajuda a organizar seus pensamentos!`);
    } else {
      recommendations.push("Use tags para categorizar suas entradas (ex: trabalho, família, saúde)");
    }
    
    return {
      insights,
      recommendations,
    };
  }),
});
