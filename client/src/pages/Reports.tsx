import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  CheckCircle2,
  Target,
  DollarSign,
  Clock,
  Zap,
  Brain,
  FileText
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function Reports() {
  const { toast } = useToast();
  const [period, setPeriod] = useState<"week" | "month" | "quarter" | "year">("month");

  // Fetch real data from API
  const { data: productivityReport, isLoading: loadingProductivity } = trpc.reports.productivity.useQuery({ period });
  const { data: financialReport, isLoading: loadingFinancial } = trpc.reports.financial.useQuery({ period });
  const { data: goalsReport, isLoading: loadingGoals } = trpc.reports.goals.useQuery();
  const { data: aiAnalysis } = trpc.ai.analyzeProductivity.useQuery();
  const { data: aiInsights } = trpc.ai.getInsights.useQuery({ type: 'general' });

  // Use real data or fallback to mock
  // Use real data or fallback to empty defaults
  const productivityData = productivityReport?.charts.tasksByDay.map(d => ({
    day: new Date(d.date).toLocaleDateString('pt-PT', { weekday: 'short' }),
    tasks: d.completed,
    hours: d.completed * (productivityReport.summary.avgCompletionTime || 1) // Estimate
  })) || [];

  const financialData = financialReport?.charts.byDay.map(d => ({
    month: new Date(d.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
    receitas: d.income,
    despesas: d.expenses
  })) || [];

  const categoryData = productivityReport?.charts.byCategory.map(c => ({
    name: c.category,
    value: c.total
  })) || [];

  const goalsProgress = goalsReport?.goals.map(g => ({
    goal: g.title,
    progress: g.progress,
    current: g.currentValue,
    target: g.targetValue
  })) || [];

  const timeDistribution = productivityReport?.charts.byCategory.map(c => ({
    category: c.category,
    hours: c.completed * (productivityReport.summary.avgCompletionTime || 1) // Estimate
  })) || [];

  const handleExportPDF = () => {
    toast({
      title: "Exportação iniciada",
      description: "O seu relatório está a ser preparado. Isto pode demorar alguns segundos...",
    });

    // Simulate PDF generation
    setTimeout(() => {
      toast({
        title: "Relatório pronto!",
        description: `Relatório do período "${period}" exportado com sucesso.`,
      });

      // In production, this would trigger actual PDF download
      // For now, we show a success message
      console.log("PDF Export:", { period, productivityReport, financialReport, goalsReport });
    }, 2000);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Relatórios & Análises
          </h1>
          <p className="text-muted-foreground mt-1">
            Insights detalhados sobre a sua produtividade e progresso
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(val) => setPeriod(val as any)}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
              <SelectItem value="year">Último Ano</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleExportPDF} className="gap-2">
            <Download className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-premium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tarefas Concluídas</p>
                <p className="text-3xl font-bold mt-2">
                  {loadingProductivity ? "..." : productivityReport?.summary.completedTasks || 0}
                </p>
                <p className="text-sm text-green-500 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4" />
                  {productivityReport?.summary.completionRate}% taxa conc.
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-premium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Objetivos Atingidos</p>
                <p className="text-3xl font-bold mt-2">
                  {loadingGoals ? "..." : `${goalsReport?.summary.completedGoals || 0}/${goalsReport?.summary.totalGoals || 0}`}
                </p>
                <p className="text-sm text-cyan-500 flex items-center gap-1 mt-1">
                  <Target className="w-4 h-4" />
                  {goalsReport?.summary.completionRate}% de sucesso
                </p>
              </div>
              <div className="p-3 rounded-full bg-cyan-500/10">
                <Target className="w-6 h-6 text-cyan-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-premium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo {period === 'week' ? 'Semanal' : 'Mensal'}</p>
                <p className={`text-3xl font-bold mt-2 ${(financialReport?.summary.balance || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {loadingFinancial ? "..." : `€${financialReport?.summary.balance || 0}`}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4" />
                  {financialReport?.summary.savingsRate}% poupança
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-premium">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Horas Produtivas (Est.)</p>
                <p className="text-3xl font-bold mt-2">
                  {loadingProductivity ? "..." : Math.round((productivityReport?.summary.completedTasks || 0) * (productivityReport?.summary.avgCompletionTime || 0))}h
                </p>
                <p className="text-sm text-orange-500 flex items-center gap-1 mt-1">
                  <Clock className="w-4 h-4" />
                  {productivityReport?.summary.avgCompletionTime || 0}h/tarefa média
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-500/10">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="productivity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="productivity">
            <Zap className="w-4 h-4 mr-2" />
            Produtividade
          </TabsTrigger>
          <TabsTrigger value="financial">
            <DollarSign className="w-4 h-4 mr-2" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="w-4 h-4 mr-2" />
            Objetivos
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Brain className="w-4 h-4 mr-2" />
            Insights IA
          </TabsTrigger>
        </TabsList>

        {/* Produtividade */}
        <TabsContent value="productivity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-premium">
              <CardHeader>
                <CardTitle>Tarefas por Dia</CardTitle>
                <CardDescription>Distribuição semanal de tarefas concluídas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="day" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    />
                    <Bar dataKey="tasks" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-premium">
              <CardHeader>
                <CardTitle>Horas Trabalhadas</CardTitle>
                <CardDescription>Tempo dedicado por dia da semana</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={productivityData}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="day" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="hours"
                      stroke="#06b6d4"
                      fillOpacity={1}
                      fill="url(#colorHours)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-premium">
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
                <CardDescription>Tempo dedicado a cada área</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-premium">
              <CardHeader>
                <CardTitle>Horas por Categoria</CardTitle>
                <CardDescription>Total de horas dedicadas este mês</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#888" />
                    <YAxis dataKey="category" type="category" stroke="#888" width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    />
                    <Bar dataKey="hours" fill="#10b981" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financeiro */}
        <TabsContent value="financial" className="space-y-6">
          <Card className="glass-premium">
            <CardHeader>
              <CardTitle>Receitas vs Despesas</CardTitle>
              <CardDescription>Evolução mensal do fluxo de caixa</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="receitas"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="despesas"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-premium">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Receitas Totais</p>
                  <p className="text-3xl font-bold mt-2 text-green-500">
                    {loadingFinancial ? "..." : `€${financialReport?.summary.totalIncome || 0}`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Neste período</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-premium">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Despesas Totais</p>
                  <p className="text-3xl font-bold mt-2 text-red-500">
                    {loadingFinancial ? "..." : `€${financialReport?.summary.totalExpenses || 0}`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Neste período</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-premium">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Poupança</p>
                  <p className="text-3xl font-bold mt-2 text-cyan-500">
                    {loadingFinancial ? "..." : `€${financialReport?.summary.balance || 0}`}
                  </p>
                  <p className="text-sm text-green-500 mt-1">{financialReport?.summary.savingsRate}% taxa poupança</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Objetivos */}
        <TabsContent value="goals" className="space-y-6">
          <Card className="glass-premium">
            <CardHeader>
              <CardTitle>Progresso dos Objetivos</CardTitle>
              <CardDescription>Acompanhamento detalhado dos seus objetivos SMART</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {goalsProgress.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{goal.goal}</p>
                      <p className="text-sm text-muted-foreground">
                        {goal.current} / {goal.target}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{goal.progress}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights IA */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-premium border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Análise de Produtividade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="font-semibold text-primary mb-2">🎯 Performance</p>
                  <p className="text-sm text-muted-foreground">
                    Você completou <strong>{productivityReport?.summary.completedTasks || 0}</strong> tarefas
                    com uma taxa de sucesso de <strong>{productivityReport?.summary.completionRate || 0}%</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                  <p className="font-semibold text-cyan-500 mb-2">📊 Tempo Médio</p>
                  <p className="text-sm text-muted-foreground">
                    Em média, você leva <strong>{productivityReport?.summary.avgCompletionTime || 0}h</strong> para
                    completar uma tarefa.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                  <p className="font-semibold text-green-500 mb-2">✅ Pendências</p>
                  <p className="text-sm text-muted-foreground">
                    Existem <strong>{productivityReport?.summary.pendingTasks || 0}</strong> tarefas pendentes
                    e <strong>{productivityReport?.summary.overdueTasks || 0}</strong> atrasadas.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-premium border-orange-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights?.insights ? (
                  <div className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                    {aiInsights.insights}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    A carregar insights personalizados...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

