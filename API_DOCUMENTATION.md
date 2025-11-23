# 📚 API Documentation - Organiza-te360

**Versão:** 2.0  
**Data:** 5 de novembro de 2025  
**Tecnologia:** tRPC + Prisma + PostgreSQL

---

## 🎯 Visão Geral

Todas as APIs implementadas com **filtros avançados**, **pesquisa**, **paginação**, **estatísticas** e **operações em massa**.

---

## 🔐 Autenticação

Todas as rotas (exceto `auth.*`) requerem autenticação via cookie de sessão.

### **auth.register**
Criar nova conta de utilizador.

```typescript
await trpc.auth.register.mutate({
  email: "user@example.com",
  password: "senha123",
  name: "Nome do Utilizador"
});
```

### **auth.login**
Fazer login.

```typescript
await trpc.auth.login.mutate({
  email: "user@example.com",
  password: "senha123"
});
```

### **auth.logout**
Fazer logout.

```typescript
await trpc.auth.logout.mutate();
```

### **auth.me**
Obter utilizador atual.

```typescript
const user = await trpc.auth.me.query();
```

---

## ✅ Tasks API

### **tasks.list** - Listar tarefas com filtros
```typescript
const result = await trpc.tasks.list.query({
  // Filtros
  status: 'todo', // 'todo' | 'in_progress' | 'done' | 'archived'
  priority: 'high', // 'low' | 'medium' | 'high'
  category: 'work', // 'work' | 'personal' | 'health' | 'finance' | 'other'
  
  // Pesquisa
  search: 'reunião',
  
  // Filtros de data
  dueDateFrom: '2025-11-01',
  dueDateTo: '2025-11-30',
  createdAfter: '2025-10-01',
  createdBefore: '2025-11-05',
  
  // Ordenação
  sortBy: 'dueDate', // 'createdAt' | 'dueDate' | 'priority' | 'title' | 'status'
  sortOrder: 'asc', // 'asc' | 'desc'
  
  // Paginação
  page: 1,
  limit: 20,
});

// Resultado
{
  tasks: Task[],
  pagination: {
    total: 45,
    page: 1,
    limit: 20,
    totalPages: 3
  }
}
```

### **tasks.getById** - Obter tarefa por ID
```typescript
const task = await trpc.tasks.getById.query({ id: 'task-id' });
```

### **tasks.create** - Criar nova tarefa
```typescript
const task = await trpc.tasks.create.mutate({
  title: 'Reunião com cliente',
  description: 'Discutir proposta de projeto',
  status: 'todo',
  priority: 'high',
  category: 'work',
  dueDate: '2025-11-10T14:00:00Z',
  scheduledTime: '14:00',
  estimatedTime: 60, // minutos
});

// Recompensa: +10 XP
```

### **tasks.update** - Atualizar tarefa
```typescript
const task = await trpc.tasks.update.mutate({
  id: 'task-id',
  title: 'Novo título',
  status: 'done',
  priority: 'medium',
});

// Se completar tarefa: +20/30/50 XP (low/medium/high)
```

### **tasks.delete** - Deletar tarefa
```typescript
await trpc.tasks.delete.mutate({ id: 'task-id' });
```

### **tasks.toggleStatus** - Alternar status (rápido)
```typescript
const task = await trpc.tasks.toggleStatus.mutate({ id: 'task-id' });
// Alterna entre 'todo' e 'done'
```

### **tasks.bulkDelete** - Deletar múltiplas tarefas
```typescript
const result = await trpc.tasks.bulkDelete.mutate({
  ids: ['task-1', 'task-2', 'task-3']
});
// { deleted: 3 }
```

### **tasks.bulkUpdateStatus** - Atualizar status em massa
```typescript
const result = await trpc.tasks.bulkUpdateStatus.mutate({
  ids: ['task-1', 'task-2'],
  status: 'done'
});
// { updated: 2 }
```

### **tasks.stats** - Estatísticas de tarefas
```typescript
const stats = await trpc.tasks.stats.query();

// Resultado
{
  total: 45,
  byStatus: {
    todo: 15,
    in_progress: 10,
    done: 18,
    archived: 2
  },
  byPriority: {
    low: 8,
    medium: 12,
    high: 5
  },
  byCategory: {
    work: 20,
    personal: 10,
    health: 5
  },
  completedToday: 3,
  overdue: 2
}
```

---

## 📅 Events API

### **events.list** - Listar eventos com filtros
```typescript
const result = await trpc.events.list.query({
  // Filtros
  category: 'work',
  
  // Pesquisa
  search: 'reunião',
  
  // Intervalo de datas
  startDate: '2025-11-01',
  endDate: '2025-11-30',
  
  // Tipo de visualização (calcula intervalo automaticamente)
  view: 'month', // 'day' | 'week' | 'month' | 'agenda'
  
  // Ordenação
  sortBy: 'startTime',
  sortOrder: 'asc',
  
  // Paginação
  page: 1,
  limit: 100,
});
```

### **events.getById** - Obter evento por ID
```typescript
const event = await trpc.events.getById.query({ id: 'event-id' });
```

### **events.create** - Criar novo evento
```typescript
const event = await trpc.events.create.mutate({
  title: 'Reunião de equipa',
  description: 'Discussão do projeto Q4',
  startTime: '2025-11-10T14:00:00Z',
  endTime: '2025-11-10T15:00:00Z',
  location: 'Sala de Reuniões A',
  category: 'work',
  color: '#FF5733',
});

// Recompensa: +5 XP
```

### **events.update** - Atualizar evento
```typescript
const event = await trpc.events.update.mutate({
  id: 'event-id',
  title: 'Novo título',
  startTime: '2025-11-10T15:00:00Z',
});
```

### **events.delete** - Deletar evento
```typescript
await trpc.events.delete.mutate({ id: 'event-id' });
```

### **events.upcoming** - Próximos eventos
```typescript
const events = await trpc.events.upcoming.query({ limit: 5 });
// Retorna os próximos 5 eventos
```

### **events.today** - Eventos de hoje
```typescript
const events = await trpc.events.today.query();
```

### **events.bulkDelete** - Deletar múltiplos eventos
```typescript
const result = await trpc.events.bulkDelete.mutate({
  ids: ['event-1', 'event-2']
});
```

### **events.stats** - Estatísticas de eventos
```typescript
const stats = await trpc.events.stats.query();

// Resultado
{
  total: 120,
  thisMonth: 15,
  byCategory: {
    work: 50,
    personal: 30,
    health: 10
  },
  upcoming: 25
}
```

### **events.checkConflicts** - Verificar conflitos de horário
```typescript
const result = await trpc.events.checkConflicts.query({
  startTime: '2025-11-10T14:00:00Z',
  endTime: '2025-11-10T15:00:00Z',
  excludeId: 'event-id' // Opcional: excluir evento específico
});

// Resultado
{
  hasConflicts: true,
  conflicts: [
    { id: '...', title: 'Outro evento', startTime: '...', endTime: '...' }
  ]
}
```

---

## 💰 Transactions API

### **transactions.list** - Listar transações com filtros
```typescript
const result = await trpc.transactions.list.query({
  // Filtros
  type: 'expense', // 'income' | 'expense'
  category: 'Alimentação',
  
  // Pesquisa
  search: 'supermercado',
  
  // Intervalo de datas
  dateFrom: '2025-11-01',
  dateTo: '2025-11-30',
  
  // Intervalo de valores
  minAmount: 10,
  maxAmount: 100,
  
  // Ordenação
  sortBy: 'date',
  sortOrder: 'desc',
  
  // Paginação
  page: 1,
  limit: 50,
});
```

### **transactions.getById** - Obter transação por ID
```typescript
const transaction = await trpc.transactions.getById.query({ id: 'transaction-id' });
```

### **transactions.create** - Criar nova transação
```typescript
const transaction = await trpc.transactions.create.mutate({
  type: 'expense',
  amount: 45.50,
  category: 'Alimentação',
  description: 'Compras no supermercado',
  date: '2025-11-05T10:30:00Z',
});

// Recompensa: +5 XP
```

### **transactions.update** - Atualizar transação
```typescript
const transaction = await trpc.transactions.update.mutate({
  id: 'transaction-id',
  amount: 50.00,
  category: 'Restaurantes',
});
```

### **transactions.delete** - Deletar transação
```typescript
await trpc.transactions.delete.mutate({ id: 'transaction-id' });
```

### **transactions.bulkDelete** - Deletar múltiplas transações
```typescript
const result = await trpc.transactions.bulkDelete.mutate({
  ids: ['trans-1', 'trans-2']
});
```

### **transactions.balance** - Saldo e resumo
```typescript
const balance = await trpc.transactions.balance.query({
  dateFrom: '2025-11-01',
  dateTo: '2025-11-30',
});

// Resultado
{
  income: 2500.00,
  expenses: 1800.00,
  balance: 700.00,
  savingsRate: 28.0 // percentagem
}
```

### **transactions.stats** - Estatísticas completas
```typescript
const stats = await trpc.transactions.stats.query({
  period: 'month' // 'week' | 'month' | 'year' | 'all'
});

// Resultado
{
  total: 45,
  income: 2500.00,
  expenses: 1800.00,
  balance: 700.00,
  savingsRate: 28.0,
  
  expensesByCategory: [
    { category: 'Alimentação', amount: 600.00, count: 15 },
    { category: 'Transporte', amount: 400.00, count: 10 },
    // ...
  ],
  
  incomeByCategory: [
    { category: 'Salário', amount: 2000.00, count: 1 },
    { category: 'Freelance', amount: 500.00, count: 3 },
  ],
  
  avgDailyIncome: 83.33,
  avgDailyExpenses: 60.00,
  
  trends: {
    incomeChange: 5.2, // +5.2% vs período anterior
    expensesChange: -3.1 // -3.1% vs período anterior
  },
  
  timeline: [
    { type: 'income', amount: 2000, date: '2025-11-01' },
    // ...
  ]
}
```

### **transactions.topCategories** - Top categorias
```typescript
const top = await trpc.transactions.topCategories.query({
  type: 'expense',
  limit: 5,
  period: 'month'
});

// Resultado
[
  { category: 'Alimentação', total: 600.00, count: 15 },
  { category: 'Transporte', total: 400.00, count: 10 },
  // ...
]
```

### **transactions.monthlyComparison** - Comparação mensal
```typescript
const comparison = await trpc.transactions.monthlyComparison.query({
  months: 6
});

// Resultado
[
  {
    month: '2025-06',
    income: 2300.00,
    expenses: 1900.00,
    balance: 400.00,
    savingsRate: 17.4
  },
  // ... mais 5 meses
]
```

---

## 🎯 Goals API

### **goals.list** - Listar objetivos
```typescript
const goals = await trpc.goals.list.query();
```

### **goals.create** - Criar objetivo
```typescript
const goal = await trpc.goals.create.mutate({
  title: 'Ler 12 livros',
  description: 'Meta de leitura anual',
  targetValue: 12,
  currentValue: 0,
  unit: 'livros',
  deadline: '2025-12-31',
  category: 'personal',
});
```

### **goals.update** - Atualizar objetivo
```typescript
const goal = await trpc.goals.update.mutate({
  id: 'goal-id',
  currentValue: 5,
});
```

### **goals.updateProgress** - Atualizar progresso
```typescript
const goal = await trpc.goals.updateProgress.mutate({
  id: 'goal-id',
  currentValue: 6,
});
// Auto-completa se currentValue >= targetValue
```

### **goals.delete** - Deletar objetivo
```typescript
await trpc.goals.delete.mutate({ id: 'goal-id' });
```

---

## 📊 Dashboard API

### **dashboard.stats** - Estatísticas gerais
```typescript
const stats = await trpc.dashboard.stats.query();

// Resultado
{
  tasksCount: 15, // tarefas pendentes
  eventsCount: 5, // eventos futuros
  goalsCount: 3, // objetivos ativos
  balance: 700.00 // saldo total
}
```

---

## 🎮 Gamification API

### **gamification.profile** - Perfil de gamificação
```typescript
const profile = await trpc.gamification.profile.query();

// Resultado
{
  level: 5,
  xp: 4250,
  badges: [
    {
      badge: {
        id: 'badge-1',
        name: 'Primeira Tarefa',
        description: 'Complete sua primeira tarefa',
        icon: '🎯',
        rarity: 'common'
      },
      earnedAt: '2025-11-01T10:00:00Z',
      progress: 100
    }
  ],
  achievements: [
    {
      id: 'ach-1',
      title: 'Produtivo',
      description: 'Complete 10 tarefas em um dia',
      unlockedAt: '2025-11-03T18:00:00Z'
    }
  ]
}
```

---

## 🔔 Notifications API

### **notifications.list** - Listar notificações
```typescript
const notifications = await trpc.notifications.list.query();
// Retorna últimas 20 notificações
```

### **notifications.markAsRead** - Marcar como lida
```typescript
await trpc.notifications.markAsRead.mutate({ id: 'notification-id' });
```

---

## 💬 Chat IA API

### **chat.list** - Histórico de mensagens
```typescript
const messages = await trpc.chat.list.query();
// Retorna últimas 50 mensagens
```

### **chat.send** - Enviar mensagem
```typescript
const response = await trpc.chat.send.mutate({
  message: 'Quais são as minhas tarefas para hoje?'
});

// Retorna resposta da IA
{
  id: 'msg-id',
  role: 'assistant',
  content: 'Você tem 3 tarefas para hoje: ...',
  createdAt: '2025-11-05T10:00:00Z'
}
```

---

## 📖 Diary API

### **diary.list** - Listar entradas do diário
```typescript
const entries = await trpc.diary.list.query();
```

### **diary.create** - Criar entrada
```typescript
const entry = await trpc.diary.create.mutate({
  title: 'Dia produtivo',
  content: 'Hoje consegui completar todas as tarefas...',
  mood: 'very_good', // 'very_bad' | 'bad' | 'neutral' | 'good' | 'very_good'
  date: '2025-11-05',
});
```

### **diary.update** - Atualizar entrada
```typescript
const entry = await trpc.diary.update.mutate({
  id: 'entry-id',
  content: 'Conteúdo atualizado...',
});
```

### **diary.delete** - Deletar entrada
```typescript
await trpc.diary.delete.mutate({ id: 'entry-id' });
```

---

## 🩸 Menstrual Cycle API

### **menstrualCycle.list** - Listar ciclos
```typescript
const cycles = await trpc.menstrualCycle.list.query();
```

### **menstrualCycle.create** - Registar ciclo
```typescript
const cycle = await trpc.menstrualCycle.create.mutate({
  startDate: '2025-11-01',
  endDate: '2025-11-05',
  flow: 'medium', // 'light' | 'medium' | 'heavy'
  symptoms: 'Cólicas leves',
});
```

### **menstrualCycle.update** - Atualizar ciclo
```typescript
const cycle = await trpc.menstrualCycle.update.mutate({
  id: 'cycle-id',
  endDate: '2025-11-06',
});
```

### **menstrualCycle.delete** - Deletar ciclo
```typescript
await trpc.menstrualCycle.delete.mutate({ id: 'cycle-id' });
```

---

## 🎁 Sistema de XP e Recompensas

### **Recompensas por Ação:**

| Ação | XP Ganho |
|------|----------|
| Criar tarefa | +10 XP |
| Completar tarefa (baixa prioridade) | +20 XP |
| Completar tarefa (média prioridade) | +30 XP |
| Completar tarefa (alta prioridade) | +50 XP |
| Criar evento | +5 XP |
| Registar transação | +5 XP |

### **Sistema de Níveis:**
- **Nível = XP / 1000 + 1**
- Exemplo: 4250 XP = Nível 5

---

## 🚀 Novidades Implementadas

### ✅ **Filtros Avançados**
- Filtrar por status, prioridade, categoria
- Intervalo de datas customizado
- Intervalo de valores (transações)
- Pesquisa full-text

### ✅ **Paginação**
- Controlo de página e limite
- Total de resultados e páginas
- Performance otimizada

### ✅ **Ordenação**
- Múltiplos campos de ordenação
- Ordem ascendente/descendente

### ✅ **Operações em Massa**
- Deletar múltiplos itens
- Atualizar status em massa

### ✅ **Estatísticas e Analytics**
- Resumos por categoria, status, prioridade
- Comparações temporais
- Tendências e mudanças percentuais
- Gráficos de evolução

### ✅ **Validações**
- Schemas Zod completos
- Mensagens de erro em português
- Verificação de ownership

### ✅ **Gamificação**
- Sistema de XP automático
- Recompensas por ações
- Tracking de atividade

---

## 📝 Exemplos de Uso Frontend

### **React Query Hook - Listar Tarefas**
```typescript
import { trpc } from '@/lib/trpc';

function TasksList() {
  const { data, isLoading } = trpc.tasks.list.useQuery({
    status: 'todo',
    sortBy: 'dueDate',
    limit: 20,
  });

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      {data?.tasks.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
      <div>
        Página {data?.pagination.page} de {data?.pagination.totalPages}
      </div>
    </div>
  );
}
```

### **Mutation - Criar Tarefa**
```typescript
function CreateTask() {
  const createTask = trpc.tasks.create.useMutation();

  const handleSubmit = async (formData) => {
    await createTask.mutateAsync({
      title: formData.title,
      priority: 'high',
      dueDate: formData.dueDate,
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 🔧 Próximos Passos

### **Fase 2: Funcionalidades Adicionais**
- [ ] Upload de anexos (S3)
- [ ] Integração Google Calendar
- [ ] Notificações push
- [ ] Exportação de dados (PDF, Excel)
- [ ] Pesquisa global (Cmd+K)

### **Fase 3: Otimizações**
- [ ] Cache com React Query
- [ ] Lazy loading
- [ ] Skeleton loaders
- [ ] Infinite scroll

---

**Documentação completa e atualizada!** 🎉
