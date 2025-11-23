import React, { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  PieChart,
  BarChart3,
  AlertTriangle,
  Target,
  Award,
  Search,
  Filter,
  Download,
  Upload,
  Calendar,
  Tag,
  Edit2,
  Trash2,
  Check,
  X,
  DollarSign,
  CreditCard,
  Zap,
  TrendingDown as TrendingDownIcon,
  Activity
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

type PeriodType = "week" | "month" | "year";
type TransactionType = "income" | "expense";
type FilterType = "all" | "income" | "expense";

// Mock categories with colors
const CATEGORIES = [
  { name: 'Alimentação', color: '#ef4444', icon: '🍔' },
  { name: 'Transportes', color: '#3b82f6', icon: '🚗' },
  { name: 'Entretenimento', color: '#8b5cf6', icon: '🎬' },
  { name: 'Saúde', color: '#10b981', icon: '🏥' },
  { name: 'Educação', color: '#f59e0b', icon: '📚' },
  { name: 'Casa', color: '#06b6d4', icon: '🏠' },
  { name: 'Compras', color: '#ec4899', icon: '🛍️' },
  { name: 'Outros', color: '#6b7280', icon: '📦' },
];

export default function Finances() {
  // Bypass authentication
  const user = { name: "Utilizador", id: "demo-user" };
  const [period, setPeriod] = useState<PeriodType>("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  // Fetch transactions from backend
  const { data: transactionsData, isLoading, refetch } = trpc.transactions.list.useQuery();
  const transactions = transactionsData?.transactions || [];
  const { data: aiInsights } = trpc.ai.getInsights.useQuery({ type: 'finance' });

  const deleteMutation = trpc.transactions.delete.useMutation({
    onSuccess: () => refetch()
  });

  // Autenticação desativada em desenvolvimento para preview
  // if (!user) { ... }

  // Calculate statistics
  const stats = useMemo(() => {
    if (!transactions) return {
      balance: 0,
      income: 0,
      expenses: 0,
      savings: 0,
      savingsRate: 0,
      transactionCount: 0
    };

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;
    const savings = income - expenses;
    const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

    return {
      balance,
      income,
      expenses,
      savings,
      savingsRate,
      transactionCount: transactions.length
    };
  }, [transactions]);

  // Calculate health score (0-100)
  const healthScore = useMemo(() => {
    const savingsWeight = stats.savingsRate * 0.5;
    const balanceWeight = stats.balance > 0 ? 30 : 0;
    const activityWeight = Math.min(stats.transactionCount / 10 * 20, 20);

    return Math.min(100, Math.round(savingsWeight + balanceWeight + activityWeight));
  }, [stats]);

  // Prepare chart data (last 6 months)
  // Prepare chart data (last 6 months)
  const chartData = useMemo(() => {
    if (!transactions) return [];

    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d;
    }).reverse();

    return last6Months.map(date => {
      const monthKey = date.toLocaleString('pt-PT', { month: 'short' });
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
      });

      const receitas = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const despesas = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: monthKey,
        receitas,
        despesas,
        saldo: receitas - despesas
      };
    });
  }, [transactions]);

  // Prepare category data for pie chart
  const categoryData = useMemo(() => {
    if (!transactions) return [];

    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const category = t.category || 'Outros';
        acc[category] = (acc[category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(expensesByCategory).map(([name, value]) => {
      const cat = CATEGORIES.find(c => c.name === name) || CATEGORIES[CATEGORIES.length - 1];
      return {
        name,
        value,
        color: cat.color,
        icon: cat.icon
      };
    });
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    return transactions.filter(transaction => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesDescription = transaction.description?.toLowerCase().includes(query);
        const matchesCategory = transaction.category?.toLowerCase().includes(query);
        if (!matchesDescription && !matchesCategory) return false;
      }

      // Type filter
      if (filterType !== "all" && transaction.type !== filterType) return false;

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchQuery, filterType]);

  const handleDelete = (id: number) => {
    if (confirm('Tem a certeza que deseja eliminar esta transação?')) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <>
      <AddTransactionDialog
        open={transactionDialogOpen}
        onOpenChange={(open) => {
          setTransactionDialogOpen(open);
          if (!open) setSelectedTransaction(null);
        }}
        initialData={selectedTransaction}
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-orange-50/20 dark:to-orange-950/10">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
                  <Wallet className="w-8 h-8 text-orange-500" />
                  Gestão Financeira
                </h1>
                <p className="text-muted-foreground">
                  Controle total das suas finanças com IA avançada
                </p>
              </div>

              <Button
                onClick={() => {
                  setSelectedTransaction(null);
                  setTransactionDialogOpen(true);
                }}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nova Transação
              </Button>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Balance Card */}
              <Card className="glass-premium border-border/50 hover-lift group">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground font-medium">Saldo Total</span>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1">
                    €{stats.balance.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {stats.balance >= 0 ? (
                      <>
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-green-600 font-semibold">Positivo</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3 text-red-600" />
                        <span className="text-red-600 font-semibold">Negativo</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Income Card */}
              <Card className="glass-premium border-border/50 hover-lift group">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground font-medium">Receitas</span>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowUpRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-green-600 mb-1">
                    €{stats.income.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Este mês
                  </div>
                </CardContent>
              </Card>

              {/* Expenses Card */}
              <Card className="glass-premium border-border/50 hover-lift group">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground font-medium">Despesas</span>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowDownRight className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-red-600 mb-1">
                    €{stats.expenses.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Este mês
                  </div>
                </CardContent>
              </Card>

              {/* Savings Rate Card */}
              <Card className="glass-premium border-border/50 hover-lift group">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground font-medium">Taxa de Poupança</span>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                    {stats.savingsRate}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stats.savingsRate >= 20 ? 'Excelente!' : stats.savingsRate >= 10 ? 'Bom' : 'Pode melhorar'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Health Score & Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Health Score */}
              <Card className="glass-premium border-border/50 hover-lift">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Score de Saúde Financeira
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-4">
                    {/* Circular Progress */}
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-muted/20"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="url(#healthGradient)"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - healthScore / 100)}`}
                          className="transition-all duration-1000"
                        />
                        <defs>
                          <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={healthScore >= 70 ? "rgb(34, 197, 94)" : healthScore >= 40 ? "rgb(251, 146, 60)" : "rgb(239, 68, 68)"} />
                            <stop offset="100%" stopColor={healthScore >= 70 ? "rgb(16, 185, 129)" : healthScore >= 40 ? "rgb(249, 115, 22)" : "rgb(220, 38, 38)"} />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className={cn(
                            "text-3xl font-black",
                            healthScore >= 70 ? "text-green-600" : healthScore >= 40 ? "text-orange-600" : "text-red-600"
                          )}>
                            {healthScore}
                          </div>
                          <div className="text-xs text-muted-foreground">/ 100</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Poupança</span>
                      <span className="font-semibold">{stats.savingsRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Saldo</span>
                      <span className={cn("font-semibold", stats.balance >= 0 ? "text-green-600" : "text-red-600")}>
                        {stats.balance >= 0 ? 'Positivo' : 'Negativo'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Atividade</span>
                      <span className="font-semibold">{stats.transactionCount} transações</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Charts Column */}
              <Card className="lg:col-span-2 glass-premium border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Evolução Financeira
                    </CardTitle>
                    <div className="flex gap-2">
                      {(['week', 'month', 'year'] as PeriodType[]).map((p) => (
                        <Button
                          key={p}
                          variant={period === p ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPeriod(p)}
                          className={cn(
                            "text-xs",
                            period === p && "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                          )}
                        >
                          {p === 'week' && 'Semana'}
                          {p === 'month' && 'Mês'}
                          {p === 'year' && 'Ano'}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="month" style={{ fontSize: '12px' }} />
                      <YAxis style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="receitas"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorReceitas)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="despesas"
                        stroke="#ef4444"
                        fillOpacity={1}
                        fill="url(#colorDespesas)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Category Breakdown & Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Category Pie Chart */}
              <Card className="glass-premium border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    Despesas por Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsPieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              border: 'none',
                              borderRadius: '8px',
                              color: 'white'
                            }}
                            formatter={(value: number) => `€${value.toFixed(2)}`}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 mt-4">
                        {categoryData.slice(0, 5).map((cat) => (
                          <div key={cat.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: cat.color }}
                              />
                              <span>{cat.icon} {cat.name}</span>
                            </div>
                            <span className="font-semibold">€{cat.value.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      Nenhuma despesa registada
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Transactions Preview */}
              <Card className="lg:col-span-2 glass-premium border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Transações Recentes</CardTitle>
                  <Button variant="ghost" size="sm" className="text-primary">
                    Ver todas
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 rounded-lg glass-premium border-border/50 animate-pulse" />
                      ))}
                    </div>
                  ) : filteredTransactions.length === 0 ? (
                    <div className="py-8 text-center">
                      <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground">Nenhuma transação registada</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredTransactions.slice(0, 5).map((transaction) => (
                        <div
                          key={transaction.id}
                          className="p-3 rounded-lg bg-gradient-to-r from-background to-muted/20 border border-border/50 hover:border-primary/30 transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                transaction.type === 'income'
                                  ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                  : 'bg-gradient-to-br from-red-500 to-pink-600'
                              )}>
                                {transaction.type === 'income' ? (
                                  <ArrowUpRight className="w-5 h-5 text-white" />
                                ) : (
                                  <ArrowDownRight className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-sm">{transaction.description}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  {transaction.category && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-medium">
                                      {CATEGORIES.find(c => c.name === transaction.category)?.icon} {transaction.category}
                                    </span>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(transaction.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "text-lg font-bold",
                                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                              )}>
                                {transaction.type === 'income' ? '+' : '-'}€{transaction.amount.toFixed(2)}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTransaction(transaction);
                                    setTransactionDialogOpen(true);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(transaction.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <Card className="glass-premium border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  Insights Financeiros de IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardContent>
                  {aiInsights?.insights ? (
                    <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                      {aiInsights.insights}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Loading skeletons */}
                      <div className="h-24 rounded-lg bg-primary/10 animate-pulse" />
                      <div className="h-24 rounded-lg bg-primary/10 animate-pulse" />
                      <div className="h-24 rounded-lg bg-primary/10 animate-pulse" />
                    </div>
                  )}
                </CardContent>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}

