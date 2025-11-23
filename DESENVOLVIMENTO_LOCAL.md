# 🛠️ Guia de Desenvolvimento Local - Organiza-te360

**Última atualização:** Novembro 2025  
**Versão:** 2.0 (Simplificada para desenvolvimento local)

---

## 📋 ÍNDICE

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação Rápida](#instalação-rápida)
3. [Configuração do .env](#configuração-do-env)
4. [Iniciar o Projeto](#iniciar-o-projeto)
5. [Estrutura do Projeto](#estrutura-do-projeto)
6. [Desenvolvimento](#desenvolvimento)
7. [Resolução de Problemas](#resolução-de-problemas)
8. [Deploy em Produção](#deploy-em-produção)

---

## 🔧 PRÉ-REQUISITOS

### Software Necessário

```
✅ Node.js 18+ (recomendado: 22.x)
✅ npm ou pnpm
✅ Git
✅ Editor de código (VS Code recomendado)
```

### Verificar Versões

```bash
node --version   # Deve ser v18.0.0 ou superior
npm --version    # Deve ser 8.0.0 ou superior
git --version    # Qualquer versão recente
```

### Instalar Node.js (se necessário)

**Windows:**
1. Baixe de https://nodejs.org/
2. Instale a versão LTS (Long Term Support)
3. Reinicie o terminal

**macOS:**
```bash
brew install node
```

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## ⚡ INSTALAÇÃO RÁPIDA

### 1. Clonar ou Extrair o Projeto

**Se tem o ZIP:**
```bash
# Extrair o ZIP para uma pasta
# Exemplo: C:\projetos\organiza-te360
```

**Se está no GitHub:**
```bash
git clone https://github.com/poetik97/organiza-te360.git
cd organiza-te360
```

### 2. Instalar Dependências

```bash
# Usando npm (padrão)
npm install

# OU usando pnpm (mais rápido)
npm install -g pnpm
pnpm install
```

**Tempo estimado:** 2-5 minutos (depende da internet)

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar ficheiro de exemplo
cp .env.example .env

# Editar o ficheiro .env com seus dados
# (ver secção seguinte)
```

### 4. Configurar Base de Dados

```bash
# Gerar cliente Prisma
npx prisma generate

# Aplicar migrações (criar tabelas)
npx prisma db push
```

### 5. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

**Pronto!** O projeto estará disponível em:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3000/api/trpc

---

## 🔐 CONFIGURAÇÃO DO .ENV

### Ficheiro .env Mínimo (Para Começar)

Crie o ficheiro `.env` na raiz do projeto com:

```env
# AMBIENTE
NODE_ENV=development

# BASE DE DADOS (Use os seus dados do Supabase)
DATABASE_URL="postgresql://postgres.vwhdihrnifhndvnzglry:SUA_PASSWORD_AQUI@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.vwhdihrnifhndvnzglry:SUA_PASSWORD_AQUI@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"

# AUTENTICAÇÃO
JWT_SECRET="dev-secret-key-change-in-production"

# SUPABASE (Para login com Google)
VITE_SUPABASE_URL="https://vwhdihrnifhndvnzglry.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aGRpaHJuaWZobmR2bnpnbHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MzA2NTksImV4cCI6MjA0NjIwNjY1OX0.u9CeJ0eEv7gGcBwmsC5G2ze1_uevL9A9aexV4cCI6MjA3NTc4MDkyNXg"

# OPENAI (Para Assistente IA)
OPENAI_API_KEY="sk-aSRAkJ5R5WAEivpWAg6NT"

# SERVIDOR
PORT=3000
```

### Como Obter Suas Próprias Credenciais

#### 1. **Supabase (Base de Dados + Auth)**

**Passo a passo:**

1. Aceda a https://supabase.com
2. Crie uma conta gratuita
3. Clique em "New Project"
4. Preencha:
   - **Name:** organiza-te360
   - **Database Password:** Escolha uma password forte
   - **Region:** Europe (North) - mais próximo de Portugal
5. Aguarde 2-3 minutos para o projeto ser criado
6. No dashboard do projeto:
   - Vá para **Settings** → **Database**
   - Copie a **Connection String** (Pooler)
   - Substitua `[YOUR-PASSWORD]` pela password que escolheu
7. Para a chave Supabase:
   - Vá para **Settings** → **API**
   - Copie o **Project URL** (para `VITE_SUPABASE_URL`)
   - Copie a **anon/public key** (para `VITE_SUPABASE_ANON_KEY`)

**Exemplo de URL:**
```
postgresql://postgres.abcdefgh:minha_password@aws-0-eu-north-1.pooler.supabase.com:5432/postgres
```

#### 2. **OpenAI (Assistente IA)**

**Passo a passo:**

1. Aceda a https://platform.openai.com
2. Crie uma conta ou faça login
3. Vá para https://platform.openai.com/api-keys
4. Clique em "Create new secret key"
5. Dê um nome: "Organiza-te360"
6. Copie a chave (começa com `sk-`)
7. **IMPORTANTE:** Guarde a chave num local seguro (não será mostrada novamente)
8. Cole no `.env` em `OPENAI_API_KEY`

**Nota:** Precisa adicionar crédito (mínimo $5) para usar a API.

#### 3. **Google Calendar (Opcional)**

Se quiser integração com Google Calendar:

1. Aceda a https://console.cloud.google.com
2. Crie um novo projeto
3. Ative a **Google Calendar API**
4. Crie credenciais OAuth 2.0
5. Adicione redirect URI: `http://localhost:3000/api/google/callback`
6. Copie Client ID e Client Secret para o `.env`

---

## 🚀 INICIAR O PROJETO

### Modo Desenvolvimento (Recomendado)

```bash
npm run dev
```

**O que acontece:**
- ✅ Servidor backend inicia na porta 3000
- ✅ Vite dev server para hot reload
- ✅ TypeScript compilation em watch mode
- ✅ Prisma client gerado automaticamente

**Aceder:**
- Frontend: http://localhost:3000
- API: http://localhost:3000/api/trpc

### Comandos Úteis

```bash
# Parar o servidor
Ctrl + C (no terminal)

# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install

# Ver logs detalhados
npm run dev --verbose

# Verificar erros TypeScript
npx tsc --noEmit

# Formatar código
npm run format

# Ver base de dados no browser
npx prisma studio
```

---

## 📁 ESTRUTURA DO PROJETO

```
organiza-te360/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/            # Páginas da aplicação
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Tasks.tsx
│   │   │   ├── Calendar.tsx
│   │   │   ├── Finances.tsx
│   │   │   ├── Goals.tsx
│   │   │   ├── MenstrualCycle.tsx
│   │   │   ├── Diary.tsx
│   │   │   ├── Chat.tsx (Assistente IA)
│   │   │   ├── Reports.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Home.tsx
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── lib/             # Utilities e configurações
│   │   └── App.tsx          # Componente principal
│   └── index.html
│
├── server/                    # Backend Express + tRPC
│   ├── _core/               # Configurações core
│   │   ├── index.ts         # Servidor Express
│   │   ├── context.ts       # Contexto tRPC
│   │   ├── trpc.ts          # Setup tRPC
│   │   └── env.ts           # Variáveis ambiente
│   ├── routers/             # Routers tRPC
│   │   ├── tasks.ts
│   │   ├── events.ts
│   │   ├── transactions.ts
│   │   ├── ai.ts
│   │   ├── menstrual.ts
│   │   ├── diary.ts
│   │   └── reports.ts
│   ├── auth.ts              # Autenticação
│   ├── db.ts                # Cliente Prisma
│   └── routers.ts           # Router principal
│
├── prisma/                   # Base de dados
│   └── schema.prisma        # Schema da BD
│
├── shared/                   # Código partilhado
│   └── const.ts            # Constantes
│
├── .env                     # Variáveis ambiente (NÃO COMMITAR!)
├── .env.example            # Exemplo de .env
├── package.json            # Dependências
├── tsconfig.json           # Config TypeScript
├── vite.config.ts          # Config Vite
└── README.md               # Documentação
```

---

## 💻 DESENVOLVIMENTO

### Criar Nova Funcionalidade

#### 1. Criar Router no Backend

```typescript
// server/routers/exemplo.ts
import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import prisma from "../db";

export const exemploRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.exemplo.findMany({
      where: { userId: ctx.user.id },
    });
  }),

  create: protectedProcedure
    .input(z.object({
      title: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.exemplo.create({
        data: {
          userId: ctx.user.id,
          title: input.title,
        },
      });
    }),
});
```

#### 2. Registar Router

```typescript
// server/routers.ts
import { exemploRouter } from "./routers/exemplo";

export const appRouter = router({
  // ... outros routers
  exemplo: exemploRouter,
});
```

#### 3. Criar Página no Frontend

```typescript
// client/src/pages/Exemplo.tsx
import { trpc } from "@/lib/trpc";

export default function Exemplo() {
  const { data, isLoading } = trpc.exemplo.list.useQuery();
  const createMutation = trpc.exemplo.create.useMutation();

  if (isLoading) return <div>A carregar...</div>;

  return (
    <div>
      <h1>Exemplo</h1>
      {data?.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  );
}
```

#### 4. Adicionar Rota

```typescript
// client/src/App.tsx
import Exemplo from "./pages/Exemplo";

<Route path="/exemplo" component={Exemplo} />
```

### Modificar Base de Dados

#### 1. Editar Schema

```prisma
// prisma/schema.prisma
model exemplo {
  id        String   @id @default(cuid())
  userId    String
  title     String
  createdAt DateTime @default(now())
  users     users    @relation(fields: [userId], references: [id])
}
```

#### 2. Aplicar Mudanças

```bash
# Gerar cliente Prisma
npx prisma generate

# Aplicar ao banco de dados
npx prisma db push
```

### Estilização

O projeto usa **Tailwind CSS**:

```tsx
<div className="bg-purple-500 text-white p-4 rounded-lg">
  Conteúdo estilizado
</div>
```

**Classes úteis:**
- `glass-premium`: Efeito glassmorphism
- `hover-lift`: Efeito hover com elevação
- `gradient-text`: Texto com gradiente

---

## 🐛 RESOLUÇÃO DE PROBLEMAS

### Problema: "Port 3000 is already in use"

**Solução 1:** Mudar porta no `.env`
```env
PORT=3001
```

**Solução 2:** Matar processo na porta 3000
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Problema: "Cannot find module '@prisma/client'"

**Solução:**
```bash
npx prisma generate
npm install
```

### Problema: "Database connection error"

**Verificar:**
1. ✅ `.env` tem `DATABASE_URL` correto
2. ✅ Password está correta (sem espaços)
3. ✅ Supabase project está ativo
4. ✅ IP está na whitelist do Supabase (ou use "Allow all")

**Testar conexão:**
```bash
npx prisma db pull
```

### Problema: "Invalid API key" no Supabase

**Solução:**
1. Vá para Supabase Dashboard
2. Settings → API
3. Copie a **anon/public key** (não a service_role!)
4. Cole no `.env` em `VITE_SUPABASE_ANON_KEY`

### Problema: Página em branco após login

**Verificar:**
1. Console do browser (F12) para erros
2. Network tab para ver requests falhados
3. Verificar se token está sendo salvo (Application → Cookies)

**Solução comum:**
```bash
# Limpar cache do browser
# Ou usar modo anónimo/incógnito
```

### Problema: "Module not found" ou erros TypeScript

**Solução:**
```bash
# Limpar tudo e reinstalar
rm -rf node_modules package-lock.json
npm install

# Reiniciar TypeScript server (VS Code)
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### Problema: Hot reload não funciona

**Solução:**
```bash
# Parar servidor
Ctrl + C

# Limpar cache Vite
rm -rf node_modules/.vite

# Reiniciar
npm run dev
```

---

## 🌐 DEPLOY EM PRODUÇÃO

### Opção 1: Railway.app (Recomendado)

**Vantagens:**
- ✅ Suporta fullstack (frontend + backend)
- ✅ Deploy automático do GitHub
- ✅ PostgreSQL incluído
- ✅ Plano gratuito disponível

**Passos:**
1. Aceda a https://railway.app
2. Conecte com GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Selecione `organiza-te360`
5. Adicione variáveis de ambiente (do `.env`)
6. Deploy automático!

### Opção 2: Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**
```bash
npm install -g vercel
vercel
```

**Backend (Railway):**
- Separe backend em repo próprio
- Deploy no Railway

### Opção 3: VPS (DigitalOcean, Hetzner)

**Requisitos:**
- Ubuntu 22.04
- Node.js 18+
- Nginx
- PM2

**Setup:**
```bash
# Clonar projeto
git clone https://github.com/poetik97/organiza-te360.git
cd organiza-te360

# Instalar dependências
npm install

# Build
npm run build

# Iniciar com PM2
pm2 start npm --name "organiza-te360" -- start
pm2 save
pm2 startup
```

---

## 📝 CHECKLIST DE DESENVOLVIMENTO

### Antes de Começar
```
□ Node.js 18+ instalado
□ Git instalado
□ Editor de código configurado
□ Conta Supabase criada
□ Conta OpenAI criada (opcional)
```

### Setup Inicial
```
□ Projeto clonado/extraído
□ npm install executado
□ .env configurado
□ npx prisma generate executado
□ npx prisma db push executado
□ npm run dev funcionando
```

### Desenvolvimento
```
□ Hot reload funciona
□ Console sem erros
□ TypeScript sem erros
□ Prisma Studio acessível (npx prisma studio)
□ Login funciona
□ Todas as páginas carregam
```

### Antes de Commit
```
□ Código formatado (npm run format)
□ TypeScript sem erros (npx tsc --noEmit)
□ .env NÃO está no commit
□ Testes passam (se aplicável)
□ Build funciona (npm run build)
```

---

## 🆘 SUPORTE

### Recursos Úteis

**Documentação:**
- Prisma: https://www.prisma.io/docs
- tRPC: https://trpc.io/docs
- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com/docs

**Comunidades:**
- Discord Prisma
- Discord tRPC
- Reddit r/reactjs
- Stack Overflow

### Contacto

Se encontrar bugs ou tiver sugestões:
1. Abra uma issue no GitHub
2. Descreva o problema detalhadamente
3. Inclua logs e screenshots

---

## ✅ RESUMO RÁPIDO

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env
cp .env.example .env
# Editar .env com suas credenciais

# 3. Setup base de dados
npx prisma generate
npx prisma db push

# 4. Iniciar
npm run dev

# 5. Aceder
# http://localhost:3000
```

**Pronto para desenvolver! 🚀**

---

*Última atualização: Novembro 2025*  
*Versão: 2.0*
