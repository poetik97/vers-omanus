import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import prisma from "../db";
import { OpenAI } from "openai";
import { TRPCError } from "@trpc/server";

// Initialize OpenAI client conditionally
let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} else {
  console.warn("OPENAI_API_KEY not set; OpenAI features are disabled.");
}

// Helper function to parse natural language task input
async function parseTaskFromNLP(userMessage: string, userId: string) {
  const systemPrompt = `Você é um assistente especializado em extrair informações de tarefas de linguagem natural.
Analise a mensagem do usuário e extraia:
- title: título da tarefa (obrigatório)
- description: descrição detalhada (opcional)
- priority: 'low', 'medium', ou 'high' (padrão: 'medium')
- category: 'work', 'personal', 'health', 'finance', ou 'other' (padrão: 'other')
- dueDate: data de vencimento em formato ISO (opcional)
- estimatedTime: tempo estimado em minutos (opcional)

Responda APENAS com um JSON válido, sem texto adicional.

Exemplos:
Entrada: "Reunião com cliente amanhã às 14h sobre o projeto"
Saída: {"title":"Reunião com cliente","description":"Sobre o projeto","priority":"medium","category":"work","dueDate":"2025-11-06T14:00:00Z","estimatedTime":60}

Entrada: "Comprar leite"
Saída: {"title":"Comprar leite","priority":"low","category":"personal"}`;

  if (!openai) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "OpenAI API key not configured" });
  }
  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.3,
  });

  const content = response.choices[0].message.content?.trim() || "{}";

  try {
    return JSON.parse(content);
  } catch (error) {
    // Fallback: create simple task
    return {
      title: userMessage.substring(0, 100),
      priority: "medium",
      category: "other",
    };
  }
}

// Analyze user productivity patterns
async function analyzeProductivity(userId: string) {
  const now = new Date();
  const last30Days = new Date(now);
  last30Days.setDate(now.getDate() - 30);

  // Get tasks from last 30 days
  const tasks = await prisma.tasks.findMany({
    where: {
      userId,
      createdAt: { gte: last30Days },
    },
    orderBy: { createdAt: 'asc' },
  });

  const completedTasks = tasks.filter(t => t.status === 'done');
  const overdueTasks = tasks.filter(
    t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now
  );

  // Calculate completion rate
  const completionRate = tasks.length > 0
    ? (completedTasks.length / tasks.length) * 100
    : 0;

  // Find peak productivity hours
  const completionsByHour: Record<number, number> = {};
  completedTasks.forEach(task => {
    if (task.completedAt) {
      const hour = new Date(task.completedAt).getHours();
      completionsByHour[hour] = (completionsByHour[hour] || 0) + 1;
    }
  });

  const peakHour = Object.entries(completionsByHour)
    .sort(([, a], [, b]) => b - a)[0]?.[0];

  // Analyze by category
  const tasksByCategory: Record<string, { total: number; completed: number }> = {};
  tasks.forEach(task => {
    if (!tasksByCategory[task.category]) {
      tasksByCategory[task.category] = { total: 0, completed: 0 };
    }
    tasksByCategory[task.category].total++;
    if (task.status === 'done') {
      tasksByCategory[task.category].completed++;
    }
  });

  // Calculate average completion time
  const completionTimes = completedTasks
    .filter(t => t.completedAt && t.createdAt)
    .map(t => {
      const created = new Date(t.createdAt).getTime();
      const completed = new Date(t.completedAt!).getTime();
      return (completed - created) / (1000 * 60 * 60); // hours
    });

  const avgCompletionTime = completionTimes.length > 0
    ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
    : 0;

  // Get user XP and level
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { xp: true, level: true, streak: true },
  });

  return {
    period: '30 dias',
    totalTasks: tasks.length,
    completedTasks: completedTasks.length,
    overdueTasks: overdueTasks.length,
    completionRate: Math.round(completionRate),
    peakProductivityHour: peakHour ? `${peakHour}:00 - ${parseInt(peakHour) + 1}:00` : 'N/A',
    avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
    tasksByCategory,
    xp: user?.xp || 0,
    level: user?.level || 1,
    streak: user?.streak || 0,
  };
}

// Generate personalized insights
// Generate personalized insights
async function generateInsights(userId: string, type: 'general' | 'finance' | 'goals' | 'health' = 'general') {
  let systemPrompt = "";
  let userPrompt = "";

  if (type === 'finance') {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const transactions = await prisma.transactions.findMany({
      where: { userId, date: { gte: startOfMonth } },
    });

    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const cat = t.category || 'Outros';
        acc[cat] = (acc[cat] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    systemPrompt = `Você é um consultor financeiro pessoal.
Analise os dados financeiros do mês atual e forneça 3 insights curtos e acionáveis.
Foque em: economia, gastos excessivos e parabenizar boas práticas.
Responda em português de Portugal.`;

    userPrompt = `Dados Financeiros:
- Receitas: €${income.toFixed(2)}
- Despesas: €${expenses.toFixed(2)}
- Saldo: €${balance.toFixed(2)}
- Taxa de Poupança: ${savingsRate.toFixed(1)}%
- Top Despesas: ${Object.entries(expensesByCategory).sort(([, a], [, b]) => b - a).slice(0, 3).map(([k, v]) => `${k}: €${v}`).join(', ')}`;

  } else if (type === 'goals') {
    const goals = await prisma.goals.findMany({
      where: { userId, status: 'active' },
      include: { goal_checkins: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    systemPrompt = `Você é um coach de objetivos.
Analise os objetivos ativos e forneça 3 conselhos motivadores ou estratégicos.
Foque em: progresso, consistência e próximos passos.
Responda em português de Portugal.`;

    userPrompt = `Objetivos Ativos:
${goals.map(g => `- ${g.title}: ${g.progress}% concluído (Prazo: ${g.deadline ? g.deadline.toISOString().split('T')[0] : 'Sem prazo'})`).join('\n')}`;

  } else if (type === 'health') {
    // Fetch menstrual data if available, otherwise generic health
    // For now assuming generic health/wellness context or menstrual if implemented
    systemPrompt = `Você é um assistente de saúde e bem-estar.
Forneça 3 dicas de bem-estar baseadas no contexto geral.
Responda em português de Portugal.`;
    userPrompt = "Forneça dicas gerais de saúde e bem-estar.";
  } else {
    // General/Productivity (existing logic)
    const analysis = await analyzeProductivity(userId);
    systemPrompt = `Você é um assistente de produtividade especializado.
Analise os dados do usuário e forneça 3-5 insights acionáveis e personalizados em português.
Seja específico, motivador e prático.`;
    userPrompt = `Dados de produtividade:
- Taxa de conclusão: ${analysis.completionRate}%
- Tarefas concluídas: ${analysis.completedTasks}/${analysis.totalTasks}
- Horário mais produtivo: ${analysis.peakProductivityHour}
- Streak: ${analysis.streak} dias`;
  }

  if (!openai) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "OpenAI API key not configured" });
  }
  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content || "Continue o bom trabalho!";
}

export const aiRouter = router({
  // Chat with AI assistant (Enhanced with Function Calling)
  chat: protectedProcedure
    .input(z.object({
      message: z.string().min(1),
      context: z.enum(['general', 'tasks', 'productivity', 'finance']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Save user message
      await prisma.chat_messages.create({
        data: {
          id: crypto.randomUUID(),
          userId: ctx.user.id,
          role: 'user',
          content: input.message,
          createdAt: new Date(),
        },
      });

      // Get recent conversation history
      const history = await prisma.chat_messages.findMany({
        where: { userId: ctx.user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      // Build context based on user data
      let contextData = '';

      if (input.context === 'tasks' || input.context === 'productivity') {
        const tasks = await prisma.tasks.findMany({
          where: { userId: ctx.user.id, status: { not: 'done' } },
          take: 10,
          orderBy: { dueDate: 'asc' },
        });
        contextData = `Tarefas pendentes: ${tasks.map(t => `"${t.title}" (${t.priority})`).join(', ')}`;
      }

      if (input.context === 'finance') {
        const balance = await prisma.transactions.findMany({
          where: { userId: ctx.user.id },
          select: { type: true, amount: true },
        });
        const income = balance.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = balance.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        contextData = `Saldo: €${(income - expenses).toFixed(2)} (Receitas: €${income.toFixed(2)}, Despesas: €${expenses.toFixed(2)})`;
      }

      // System prompt
      const systemPrompt = `Você é o assistente IA do Organiza-te360, uma plataforma de organização pessoal.
Você ajuda usuários com:
- Gestão de tarefas e produtividade
- Planejamento de eventos
- Controle financeiro
- Definição e acompanhamento de objetivos

Seja útil, conciso e motivador. Responda em português de Portugal.
${contextData ? `\nContexto do usuário: ${contextData}` : ''}`;

      // Define available functions
      const functions = [
        {
          name: "create_task",
          description: "Cria uma nova tarefa para o utilizador",
          parameters: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Título da tarefa"
              },
              description: {
                type: "string",
                description: "Descrição detalhada da tarefa"
              },
              priority: {
                type: "string",
                enum: ["low", "medium", "high"],
                description: "Prioridade da tarefa"
              },
              category: {
                type: "string",
                enum: ["work", "personal", "health", "finance", "other"],
                description: "Categoria da tarefa"
              },
              dueDate: {
                type: "string",
                description: "Data de vencimento em formato ISO (YYYY-MM-DDTHH:mm:ss)"
              }
            },
            required: ["title"]
          }
        },
        {
          name: "create_event",
          description: "Cria um novo evento no calendário do utilizador",
          parameters: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Título do evento"
              },
              description: {
                type: "string",
                description: "Descrição do evento"
              },
              startTime: {
                type: "string",
                description: "Data e hora de início em formato ISO"
              },
              endTime: {
                type: "string",
                description: "Data e hora de fim em formato ISO"
              },
              location: {
                type: "string",
                description: "Local do evento"
              },
              category: {
                type: "string",
                enum: ["work", "personal", "health", "finance", "other"],
                description: "Categoria do evento"
              }
            },
            required: ["title", "startTime", "endTime"]
          }
        }
      ];

      // Call OpenAI with function calling
      if (!openai) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "OpenAI API key not configured" });
      }
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...history.reverse().map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
          { role: "user", content: input.message },
        ],
        functions: functions,
        function_call: "auto",
        temperature: 0.8,
        max_tokens: 500,
      });

      const message = response.choices[0].message;
      let aiResponse = message.content || "Desculpe, não consegui processar isso.";
      let actionTaken: { type: 'task' | 'event', id: string, title: string } | null = null;

      // Handle function calls
      if (message.function_call) {
        const functionName = message.function_call.name;
        const functionArgs = JSON.parse(message.function_call.arguments);

        if (functionName === "create_task") {
          // Create task
          const task = await prisma.tasks.create({
            data: {
              id: crypto.randomUUID(),
              userId: ctx.user.id,
              title: functionArgs.title,
              description: functionArgs.description || null,
              status: 'todo',
              priority: functionArgs.priority || 'medium',
              category: functionArgs.category || 'other',
              dueDate: functionArgs.dueDate ? new Date(functionArgs.dueDate) : null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });

          actionTaken = { type: 'task', id: task.id, title: task.title };
          aiResponse = `✅ Criei a tarefa "${task.title}" para ti! Podes vê-la na secção de Tarefas.`;

          // Award XP
          await prisma.users.update({
            where: { id: ctx.user.id },
            data: { xp: { increment: 15 } },
          });
        } else if (functionName === "create_event") {
          // Create event
          const event = await prisma.events.create({
            data: {
              id: crypto.randomUUID(),
              userId: ctx.user.id,
              title: functionArgs.title,
              description: functionArgs.description || null,
              startTime: new Date(functionArgs.startTime),
              endTime: new Date(functionArgs.endTime),
              location: functionArgs.location || null,
              category: functionArgs.category || 'other',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });

          actionTaken = { type: 'event', id: event.id, title: event.title };
          aiResponse = `📅 Agendei o evento "${event.title}" no teu calendário!`;

          // Award XP
          await prisma.users.update({
            where: { id: ctx.user.id },
            data: { xp: { increment: 15 } },
          });
        }
      }

      // Save AI response
      const savedMessage = await prisma.chat_messages.create({
        data: {
          id: crypto.randomUUID(),
          userId: ctx.user.id,
          role: 'assistant',
          content: aiResponse,
          createdAt: new Date(),
        },
      });

      return {
        ...savedMessage,
        action: actionTaken,
      };
    }),

  // Create task from natural language
  createTaskFromNLP: protectedProcedure
    .input(z.object({
      message: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Parse task from natural language
      const taskData = await parseTaskFromNLP(input.message, ctx.user.id);

      // Create task
      const task = await prisma.tasks.create({
        data: {
          id: crypto.randomUUID(),
          userId: ctx.user.id,
          title: taskData.title,
          description: taskData.description,
          status: 'todo',
          priority: taskData.priority || 'medium',
          category: taskData.category || 'other',
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
          scheduledTime: taskData.scheduledTime,
          estimatedTime: taskData.estimatedTime,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Award XP
      await prisma.users.update({
        where: { id: ctx.user.id },
        data: { xp: { increment: 15 } }, // Bonus for using AI
      });

      return {
        task,
        message: `✅ Tarefa "${task.title}" criada com sucesso!`,
      };
    }),

  // Get productivity analysis
  analyzeProductivity: protectedProcedure.query(async ({ ctx }) => {
    return await analyzeProductivity(ctx.user.id);
  }),

  // Get personalized insights
  getInsights: protectedProcedure
    .input(z.object({
      type: z.enum(['general', 'finance', 'goals', 'health']).optional().default('general'),
    }))
    .query(async ({ ctx, input }) => {
      const insights = await generateInsights(ctx.user.id, input.type);
      return { insights };
    }),

  // Suggest tasks based on patterns
  suggestTasks: protectedProcedure.query(async ({ ctx }) => {
    const analysis = await analyzeProductivity(ctx.user.id);

    const systemPrompt = `Baseado nos padrões de produtividade do usuário, sugira 3 tarefas que ele deveria considerar adicionar.
Seja específico e relevante às categorias que ele mais usa.
Responda em formato JSON array: [{"title": "...", "category": "...", "priority": "...", "reason": "..."}]`;

    const userPrompt = `Categorias mais usadas:
${Object.entries(analysis.tasksByCategory)
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 3)
        .map(([cat, data]) => `- ${cat}: ${data.total} tarefas`)
        .join('\n')}

Taxa de conclusão: ${analysis.completionRate}%
Horário produtivo: ${analysis.peakProductivityHour}`;

    if (!openai) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "OpenAI API key not configured" });
    }
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    try {
      const content = response.choices[0].message.content?.trim() || "[]";
      const suggestions = JSON.parse(content);
      return { suggestions };
    } catch {
      return { suggestions: [] };
    }
  }),

  // Daily summary
  dailySummary: protectedProcedure.query(async ({ ctx }) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [tasksToday, eventsToday, transactionsToday] = await Promise.all([
      prisma.tasks.findMany({
        where: {
          userId: ctx.user.id,
          OR: [
            { dueDate: { gte: startOfDay, lte: endOfDay } },
            { completedAt: { gte: startOfDay, lte: endOfDay } },
          ],
        },
      }),
      prisma.events.findMany({
        where: {
          userId: ctx.user.id,
          startTime: { gte: startOfDay, lte: endOfDay },
        },
        orderBy: { startTime: 'asc' },
      }),
      prisma.transactions.findMany({
        where: {
          userId: ctx.user.id,
          date: { gte: startOfDay, lte: endOfDay },
        },
      }),
    ]);

    const completedToday = tasksToday.filter(t => t.status === 'done').length;
    const pendingToday = tasksToday.filter(t => t.status !== 'done').length;

    const expensesToday = transactionsToday
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const systemPrompt = `Crie um resumo motivador do dia do usuário em 2-3 frases.
Seja positivo e específico. Responda em português de Portugal.`;

    const userPrompt = `Resumo do dia:
- ${completedToday} tarefas concluídas, ${pendingToday} pendentes
- ${eventsToday.length} eventos agendados
- €${expensesToday.toFixed(2)} em despesas

Próximo evento: ${eventsToday[0]?.title || 'Nenhum'}`;

    if (!openai) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "OpenAI API key not configured" });
    }
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
    });

    return {
      summary: response.choices[0].message.content || "Tenha um ótimo dia!",
      stats: {
        tasksCompleted: completedToday,
        tasksPending: pendingToday,
        eventsCount: eventsToday.length,
        expensesTotal: expensesToday,
      },
      nextEvent: eventsToday[0] || null,
    };
  }),
  // Parse event from natural language
  parseEvent: protectedProcedure
    .input(z.object({
      message: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const systemPrompt = `Você é um assistente especializado em extrair informações de eventos de linguagem natural.
Analise a mensagem do usuário e extraia:
- title: título do evento (obrigatório)
- description: descrição detalhada (opcional)
- startTime: data e hora de início em formato ISO (obrigatório, assuma data futura próxima se não especificado)
- endTime: data e hora de fim em formato ISO (opcional, padrão 1h após início)
- location: local do evento (opcional)
- category: 'work', 'personal', 'health', 'finance', ou 'other' (padrão: 'personal')

Responda APENAS com um JSON válido, sem texto adicional.

Exemplos:
Entrada: "Almoço com João amanhã às 13h no Restaurante X"
Saída: {"title":"Almoço com João","description":"","startTime":"2025-11-23T13:00:00Z","endTime":"2025-11-23T14:00:00Z","location":"Restaurante X","category":"personal"}

Entrada: "Reunião de projeto na sexta as 10"
Saída: {"title":"Reunião de projeto","startTime":"2025-11-28T10:00:00Z","endTime":"2025-11-28T11:00:00Z","category":"work"}`;

      if (!openai) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "OpenAI API key not configured" });
      }
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Data atual: ${new Date().toISOString()}\nMensagem: ${input.message}` },
        ],
        temperature: 0.3,
      });

      const content = response.choices[0].message.content?.trim() || "{}";

      try {
        return JSON.parse(content);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Falha ao processar evento com IA',
        });
      }
    }),
});
