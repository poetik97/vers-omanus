import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, Smile, Meh, Frown, TrendingUp, Calendar, Tag } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Diary() {
  // Bypass authentication
  const user = { name: "Utilizador", id: "demo-user" };
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    mood: "neutral" as "very_bad" | "bad" | "neutral" | "good" | "very_good",
    tags: ""
  });
  
  // Fetch diary entries from API
  const { data, isLoading, refetch } = trpc.diary.list.useQuery();
  const { data: stats, refetch: refetchStats } = trpc.diary.stats.useQuery();
  const { data: insights } = trpc.diary.insights.useQuery();
  
  // Create mutation
  const createEntry = trpc.diary.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Entrada criada com sucesso.",
      });
      setIsDialogOpen(false);
      setNewEntry({ title: "", content: "", mood: "neutral", tags: "" });
      refetch();
      refetchStats();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar entrada.",
        variant: "destructive",
      });
    },
  });
  
  const handleCreateEntry = () => {
    if (!newEntry.content.trim()) {
      toast({
        title: "Erro",
        description: "O conteúdo não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }
    
    createEntry.mutate({
      title: newEntry.title || undefined,
      content: newEntry.content,
      mood: newEntry.mood,
      tags: newEntry.tags ? newEntry.tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
    });
  };
  
  const entries = data?.entries || [];
  const diaryStats = stats || {
    totalEntries: 0,
    avgSentimentScore: 0,
    currentStreak: 0,
    moodDistribution: [],
    sentimentDistribution: [],
    topTags: [],
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'very_good':
      case 'good':
        return <Smile className="w-5 h-5 text-green-500" />;
      case 'neutral':
        return <Meh className="w-5 h-5 text-yellow-500" />;
      case 'bad':
      case 'very_bad':
        return <Frown className="w-5 h-5 text-red-500" />;
      default:
        return <Meh className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSentimentColor = (score: number) => {
    if (score > 30) return 'text-green-500';
    if (score > 10) return 'text-green-400';
    if (score < -30) return 'text-red-500';
    if (score < -10) return 'text-red-400';
    return 'text-yellow-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/20 dark:to-purple-950/10">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-purple-500" />
                Diário Pessoal
              </h2>
              <p className="text-muted-foreground mt-1">
                Registe os seus pensamentos e reflexões
              </p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 glow-premium">
              <Plus className="w-5 h-5 mr-2" />
              Nova Entrada
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="glass-premium border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Entradas</p>
                    <p className="text-2xl font-bold">{diaryStats.totalEntries}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-premium border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sentimento Médio</p>
                    <p className={`text-2xl font-bold ${getSentimentColor(diaryStats.avgSentimentScore)}`}>
                      {diaryStats.avgSentimentScore > 0 ? '+' : ''}{diaryStats.avgSentimentScore}
                    </p>
                  </div>
                  <TrendingUp className={`w-8 h-8 ${getSentimentColor(diaryStats.avgSentimentScore)}`} />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-premium border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Streak Atual</p>
                    <p className="text-2xl font-bold">{diaryStats.currentStreak} dias 🔥</p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-premium border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tags Usadas</p>
                    <p className="text-2xl font-bold">{diaryStats.topTags.length}</p>
                  </div>
                  <Tag className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          {insights && insights.insights.length > 0 && (
            <Card className="glass-premium border-border/50 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  Insights de IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.insights.map((insight, index) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      • {insight}
                    </p>
                  ))}
                </div>
                {insights.recommendations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-sm font-medium mb-2">Recomendações:</p>
                    <div className="space-y-1">
                      {insights.recommendations.map((rec, index) => (
                        <p key={index} className="text-sm text-muted-foreground">
                          • {rec}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Entries List */}
        <Card className="glass-premium border-border/50">
          <CardHeader>
            <CardTitle>Entradas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">A carregar entradas...</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Ainda não tem entradas no diário. Comece a escrever!
                </p>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-purple-500 to-pink-600">
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Primeira Entrada
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry: any) => (
                  <Card key={entry.id} className="border-border/50 hover:border-purple-500/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          {entry.title && (
                            <h3 className="text-lg font-semibold mb-2">{entry.title}</h3>
                          )}
                          <p className="text-muted-foreground line-clamp-3">
                            {entry.content}
                          </p>
                        </div>
                        {entry.mood && (
                          <div className="ml-4">
                            {getMoodIcon(entry.mood)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span>{new Date(entry.createdAt).toLocaleDateString('pt-PT')}</span>
                          {entry.sentiment && (
                            <span className={`font-medium ${getSentimentColor(entry.sentimentScore || 0)}`}>
                              Sentimento: {entry.sentiment} ({entry.sentimentScore > 0 ? '+' : ''}{entry.sentimentScore})
                            </span>
                          )}
                        </div>
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex gap-2">
                            {entry.tags.slice(0, 3).map((tag: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Tags */}
        {diaryStats.topTags.length > 0 && (
          <Card className="glass-premium border-border/50 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-500" />
                Tags Mais Usadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {diaryStats.topTags.map((tagData: any, index: number) => (
                  <span key={index} className="px-3 py-2 bg-blue-500/10 text-blue-500 rounded-full text-sm font-medium">
                    {tagData.tag} ({tagData.count})
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      
      {/* Create Entry Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nova Entrada no Diário</DialogTitle>
            <DialogDescription>
              Registe os seus pensamentos e reflexões do dia.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título (opcional)</Label>
              <Input
                id="title"
                placeholder="Ex: Um dia produtivo"
                value={newEntry.title}
                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Conteúdo *</Label>
              <Textarea
                id="content"
                placeholder="Escreva aqui os seus pensamentos..."
                className="min-h-[200px]"
                value={newEntry.content}
                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mood">Como se sente?</Label>
              <Select value={newEntry.mood} onValueChange={(value: any) => setNewEntry({ ...newEntry, mood: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very_good">😄 Muito Bem</SelectItem>
                  <SelectItem value="good">🙂 Bem</SelectItem>
                  <SelectItem value="neutral">😐 Neutro</SelectItem>
                  <SelectItem value="bad">😟 Mal</SelectItem>
                  <SelectItem value="very_bad">😢 Muito Mal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input
                id="tags"
                placeholder="Ex: trabalho, família, saúde"
                value={newEntry.tags}
                onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateEntry} disabled={createEntry.isPending} className="bg-gradient-to-r from-purple-500 to-pink-600">
              {createEntry.isPending ? "A criar..." : "Criar Entrada"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
