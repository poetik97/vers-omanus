import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Sparkles, Bot, User as UserIcon, Loader2, CheckCircle2, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  action?: {
    type: 'task' | 'event';
    id: string;
    title: string;
  };
}

export default function Chat() {
  const { user } = useSupabaseAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Olá ${user?.name || ""}! 👋 Sou o seu assistente inteligente do Organiza-te360. Posso ajudá-lo com:\n\n• Análise de tarefas e produtividade\n• Sugestões de organização\n• Insights financeiros\n• Planeamento de objetivos\n• Dicas de bem-estar\n\n**Novidade:** Agora posso criar tarefas e eventos para ti! Basta pedires, por exemplo:\n- "Cria uma tarefa para comprar leite amanhã"\n- "Agenda reunião com João na sexta às 15h"\n\nComo posso ajudar hoje?`,
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.content,
          timestamp: new Date(data.createdAt),
          action: data.action || undefined,
        },
      ]);
    },
    onError: (error) => {
      toast.error("Erro ao enviar mensagem: " + error.message);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || chatMutation.isPending) return;

    const userMessage = message.trim();
    setMessage("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      },
    ]);

    chatMutation.mutate({
      message: userMessage,
      context: "general",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };



  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-purple-500" />
            Assistente IA
          </h2>
          <p className="text-muted-foreground mt-1">
            Converse com o seu assistente inteligente potenciado por GPT-4
          </p>
        </div>

        <Card className="glass-premium border-border/50 h-[calc(100vh-250px)] flex flex-col">
          <CardHeader className="border-b border-border/40 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              Chat IA Premium
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                Powered by GPT-4
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}

                <div className="max-w-[70%] space-y-2">
                  <div
                    className={`rounded-2xl px-4 py-3 ${msg.role === "user"
                      ? "bg-gradient-to-br from-primary to-purple-600 text-white"
                      : "bg-muted/50 border border-border/40"
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {msg.timestamp.toLocaleTimeString("pt-PT", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Action Feedback */}
                  {msg.action && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
                      {msg.action.type === 'task' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {msg.action.type === 'task' ? 'Tarefa criada' : 'Evento agendado'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {msg.action.title}
                        </p>
                      </div>
                      <Link href={msg.action.type === 'task' ? '/tasks' : '/calendar'}>
                        <Button size="sm" variant="outline" className="text-xs">
                          Ver
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-muted/50 border border-border/40 rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-4 border-t border-border/40 bg-background/50">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1"
                disabled={chatMutation.isPending}
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || chatMutation.isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                {chatMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              A IA pode cometer erros. Verifique informações importantes.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}
