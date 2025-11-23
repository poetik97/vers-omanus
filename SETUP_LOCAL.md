# 🚀 Guia de Instalação Local - Organiza-te360

Este guia explica como correr o projeto **Organiza-te360** localmente na sua máquina.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** v18 ou superior ([Download](https://nodejs.org/))
- **npm** ou **pnpm** (recomendado)
- **Git** ([Download](https://git-scm.com/))
- Conta **Supabase** (grátis) - [supabase.com](https://supabase.com)

---

## 🔧 Passo 1: Clonar o Repositório

```bash
git clone https://github.com/poetik97/organiza-te360.git
cd organiza-te360
```

---

## 📦 Passo 2: Instalar Dependências

```bash
npm install
```

**Ou com pnpm (mais rápido):**
```bash
pnpm install
```

---

## 🗄️ Passo 3: Configurar Base de Dados Supabase

### 3.1. Criar Projeto no Supabase

1. Aceda a [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em **"New Project"**
4. Preencha:
   - **Name:** Organiza-te360
   - **Database Password:** (escolha uma password forte)
   - **Region:** Europe North (Stockholm) - ou mais próximo de si
5. Clique em **"Create new project"**
6. Aguarde 2-3 minutos até o projeto estar pronto

### 3.2. Obter Credenciais de Conexão

1. No dashboard do Supabase, vá a **Settings** → **Database**
2. Procure por **Connection String**
3. Copie as duas URLs:

**Connection pooling (porta 6543):**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
```

**Direct connection (porta 5432):**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```

⚠️ **Importante:** Remova `?pgbouncer=true` do final da URL se existir!

---

## 🔑 Passo 4: Configurar Variáveis de Ambiente

Crie um ficheiro `.env` na raiz do projeto:

```bash
# Copiar template
cp .env.example .env
```

Edite o ficheiro `.env` e adicione:

```env
# Base de Dados Supabase
DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-1-eu-north-1.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"

# JWT Secret (gere uma string aleatória)
JWT_SECRET="sua-chave-secreta-super-segura-aqui"

# Supabase (opcional - para features avançadas)
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_ANON_KEY="sua-anon-key-aqui"

# OpenAI (opcional - para Chat IA)
OPENAI_API_KEY="sk-..."

# App Config
VITE_APP_TITLE="Organiza-te360"
VITE_APP_LOGO="/app-icon.png"
```

### Como gerar JWT_SECRET:

**No terminal:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🗃️ Passo 5: Criar Tabelas na Base de Dados

Execute o Prisma para criar todas as tabelas:

```bash
npx prisma generate
npx prisma db push
```

✅ Isso criará automaticamente todas as 16 tabelas no Supabase!

---

## 🚀 Passo 6: Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

**Ou com pnpm:**
```bash
pnpm dev
```

O servidor iniciará em:
```
http://localhost:3000
```

---

## ✅ Passo 7: Verificar se Está Tudo a Funcionar

1. Abra o browser em `http://localhost:3000`
2. Deve ver a landing page do Organiza-te360
3. Clique em **"Entrar"** - será redirecionado para o Dashboard
4. Tente criar:
   - ✅ Uma tarefa
   - ✅ Um evento no calendário
   - ✅ Uma transação financeira
   - ✅ Um objetivo

5. Verifique no Supabase se os dados foram salvos:
   - Vá ao Supabase Dashboard → **Table Editor**
   - Veja as tabelas `tasks`, `events`, `transactions`, `goals`

---

## 🏗️ Build para Produção

Para criar uma versão otimizada para produção:

```bash
npm run build
npm start
```

Isso criará os ficheiros otimizados em `dist/` e iniciará o servidor em modo produção.

---

## 🐛 Resolução de Problemas

### Erro: "Cannot connect to database"

**Solução:**
- Verifique se as URLs no `.env` estão corretas
- Certifique-se de que removeu `?pgbouncer=true`
- Teste a conexão no Supabase Dashboard

### Erro: "Prisma Client not generated"

**Solução:**
```bash
npx prisma generate
```

### Erro: "Port 3000 already in use"

**Solução:**
```bash
# Matar processo na porta 3000
npx kill-port 3000

# Ou usar outra porta
PORT=3001 npm run dev
```

### Erro: "Module not found"

**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Iniciar servidor de desenvolvimento

# Build
npm run build            # Compilar para produção
npm start                # Iniciar servidor de produção

# Base de Dados
npx prisma studio        # Abrir interface visual da BD
npx prisma db push       # Aplicar schema à BD
npx prisma generate      # Gerar Prisma Client
npx prisma migrate dev   # Criar migração

# Linting
npm run lint             # Verificar código
npm run format           # Formatar código
```

---

## 🌐 Deploy para Produção

Consulte os guias de deploy:
- **Google Cloud Run:** `DEPLOY_GCP.md`
- **Docker:** `DEPLOY.md`

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no terminal
2. Consulte a documentação do Supabase
3. Abra uma issue no GitHub

---

## 🎉 Pronto!

Agora tem o **Organiza-te360** a correr localmente! 🚀

Bom desenvolvimento! 💜

