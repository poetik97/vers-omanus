import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import {
  Sparkles,
  CheckCircle2,
  Shield,
  Zap,
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  Chrome
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, signInWithGoogle, user, loading } = useSupabaseAuth();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user && !loading) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      // Redirect handled by useEffect when user state changes
    } catch (error) {
      // Error handled by useSupabaseAuth hook
      console.error('Login error:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding */}
        <motion.div
          className="hidden lg:block"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-6">
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.img
                src={APP_LOGO}
                alt={APP_TITLE}
                className="w-12 h-12"
                animate={{
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <h1 className="text-4xl font-bold gradient-text">{APP_TITLE}</h1>
            </motion.div>

            <motion.h2
              className="text-3xl font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Organize a sua vida com{" "}
              <span className="gradient-text">Inteligência Artificial</span>
            </motion.h2>

            <motion.p
              className="text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              A plataforma premium que transforma a forma como gere o seu tempo,
              finanças e objetivos.
            </motion.p>

            <motion.div
              className="space-y-4 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[
                {
                  icon: Sparkles,
                  title: "IA Avançada",
                  description: "Sugestões inteligentes e automações personalizadas",
                  color: "primary",
                  delay: 0.6,
                },
                {
                  icon: Zap,
                  title: "Produtividade Máxima",
                  description: "Aumente 3x sua produtividade com automações inteligentes",
                  color: "cyan-500",
                  delay: 0.7,
                },
                {
                  icon: Shield,
                  title: "Segurança Total",
                  description: "Seus dados protegidos com encriptação de ponta a ponta",
                  color: "green-500",
                  delay: 0.8,
                },
                {
                  icon: CheckCircle2,
                  title: "Tudo num Só Lugar",
                  description: "Tarefas, calendário, finanças, objetivos e muito mais",
                  color: "orange-500",
                  delay: 0.9,
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: feature.delay }}
                  whileHover={{ x: 10 }}
                >
                  <motion.div
                    className={`mt-1 p-2 rounded-lg bg-${feature.color}/10 group-hover:bg-${feature.color}/20 transition-colors`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <feature.icon className={`w-5 h-5 text-${feature.color}`} />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          className="w-full"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="glass-premium border-border/50 shadow-2xl backdrop-blur-xl">
            <CardHeader className="text-center space-y-2 pb-6">
              <motion.div
                className="mx-auto mb-4 lg:hidden"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <img src={APP_LOGO} alt={APP_TITLE} className="w-16 h-16 mx-auto" />
              </motion.div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Bem-vindo de volta!
              </CardTitle>
              <CardDescription className="text-base">
                Faça login para aceder à sua conta
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </motion.div>

                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:from-primary/90 hover:via-purple-600/90 hover:to-pink-600/90 shadow-lg hover:shadow-xl hover:shadow-primary/50 transition-all duration-300 group"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        A entrar...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">Entrar</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Divider */}
              <motion.div
                className="relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Ou continue com
                  </span>
                </div>
              </motion.div>

              {/* Google Login */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 hover:border-primary/50 transition-all group"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <Chrome className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Continuar com Google
                </Button>
              </motion.div>

              {/* Divider */}
              <motion.div
                className="relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Ainda não tem conta?
                  </span>
                </div>
              </motion.div>

              {/* Register Link */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Link href="/register">
                  <Button
                    variant="outline"
                    className="w-full h-12 bg-gradient-to-r from-primary/10 to-purple-600/10 border-primary/30 hover:from-primary/20 hover:to-purple-600/20 hover:border-primary/50 transition-all"
                  >
                    Criar Conta Grátis
                  </Button>
                </Link>
              </motion.div>

              {/* Features */}
              <motion.div
                className="grid grid-cols-3 gap-4 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {[
                  { value: "10k+", label: "Utilizadores" },
                  { value: "98%", label: "Satisfação" },
                  { value: "50h", label: "Poupadas/mês" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
