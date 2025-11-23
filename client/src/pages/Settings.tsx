import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Save, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { GoogleIntegration } from "@/components/GoogleIntegration";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    name: "Utilizador Demo",
    email: "demo@organiza-te360.com",
    bio: "Apaixonado por produtividade e organização."
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Perfil atualizado",
        description: "As suas informações foram guardadas com sucesso."
      });
    }, 1000);
  };



  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-purple-500" />
            Definições
          </h2>
          <p className="text-muted-foreground mt-1">Personalize a sua experiência</p>
        </div>

        <div className="grid gap-6">
          <GoogleIntegration />

          <Card className="glass-premium border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full sm:w-auto">
                  {isSaving ? (
                    <>A guardar...</>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Alterações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-premium border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Configurar preferências de notificações</p>
                <Link href="/settings/notifications">
                  <Button variant="outline" className="gap-2">
                    Configurar
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-premium border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacidade & Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">Gerir dados, privacidade e conformidade GDPR/LGPD</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Preferências de Cookies</p>
                    <p className="text-xs text-muted-foreground">Gerir consentimento de cookies</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const event = new CustomEvent('openCookiePreferences');
                      window.dispatchEvent(event);
                    }}
                  >
                    Gerir
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Exportar Meus Dados</p>
                    <p className="text-xs text-muted-foreground">Baixar cópia dos seus dados (GDPR/LGPD)</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const event = new CustomEvent('openDataExport');
                      window.dispatchEvent(event);
                    }}
                  >
                    Exportar
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="space-y-1">
                    <p className="font-medium text-sm text-destructive">Excluir Conta</p>
                    <p className="text-xs text-muted-foreground">Excluir permanentemente sua conta e dados</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const event = new CustomEvent('openAccountDeletion');
                      window.dispatchEvent(event);
                    }}
                  >
                    Excluir
                  </Button>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <p className="text-xs font-medium">Documentos Legais:</p>
                  <div className="flex flex-wrap gap-2">
                    <a href="/privacy-policy" className="text-xs text-primary hover:underline">
                      Política de Privacidade
                    </a>
                    <span className="text-xs text-muted-foreground">•</span>
                    <a href="/terms-of-service" className="text-xs text-primary hover:underline">
                      Termos de Serviço
                    </a>
                    <span className="text-xs text-muted-foreground">•</span>
                    <a href="/cookie-policy" className="text-xs text-primary hover:underline">
                      Política de Cookies
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


          <Card className="glass-premium border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Aparência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Personalizar tema e interface</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
