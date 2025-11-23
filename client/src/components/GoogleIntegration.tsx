import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Calendar, CheckCircle2, XCircle, Loader2, Download, Upload } from "lucide-react";

export function GoogleIntegration() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate API call
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      toast.success("Google Calendar conectado com sucesso!");
    }, 1500);
  };

  const handleDisconnect = () => {
    if (confirm("Tem certeza que deseja desconectar o Google Calendar?")) {
      setIsConnected(false);
      toast.success("Google Calendar desconectado.");
    }
  };

  const handleImport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'A importar eventos...',
        success: 'Eventos importados com sucesso!',
        error: 'Erro ao importar eventos',
      }
    );
  };

  const handleExport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'A exportar eventos...',
        success: 'Eventos exportados com sucesso!',
        error: 'Erro ao exportar eventos',
      }
    );
  };

  return (
    <Card className="glass-premium border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Google Calendar
            </CardTitle>
            <CardDescription>
              Sincronize seus eventos com o Google Calendar
            </CardDescription>
          </div>
          {isConnected ? (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          ) : (
            <XCircle className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnecting ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3">Conectando...</span>
          </div>
        ) : isConnected ? (
          <>
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Conectado ao Google Calendar</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleImport}
                variant="outline"
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Importar
              </Button>

              <Button
                onClick={handleExport}
                variant="outline"
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>

            <Button
              onClick={handleDisconnect}
              variant="destructive"
              className="w-full"
            >
              Desconectar
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Conecte sua conta Google para sincronizar eventos automaticamente entre o Organiza-te360 e o Google Calendar.
            </p>
            <Button
              onClick={handleConnect}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Conectar Google Calendar
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

