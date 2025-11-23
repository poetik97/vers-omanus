# 🗄️ Configuração Supabase - Organiza-te360

## ✅ Projeto Criado com Sucesso

O teu projeto Supabase **"organiza"** está configurado e pronto a usar!

---

## 📋 Credenciais de Conexão

### **Informações do Projeto**

- **Nome do Projeto:** organiza
- **Project ID:** `vwhdihrnifhndvnzglry`
- **Region:** Frankfurt (EU Central)
- **Plan:** Free Tier

### **Project URL**
```
https://vwhdihrnifhndvnzglry.supabase.co
```

### **API Keys**

**ANON (Public) Key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aGRpaHJuaWZobmR2bnpnbHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MzAxMjIsImV4cCI6MjA0NjIwNjEyMn0.evJgc3MiOzJzdXBhYmFzZSI
```

**SERVICE_ROLE (Secret) Key:**
```
[Precisa ser revelada nas API Keys settings]
```

### **Database Connection**

**Direct Connection String:**
```
postgresql://postgres:[YOUR_PASSWORD]@db.vwhdihrnifhndvnzglry.supabase.co:5432/postgres
```

**Connection Parameters:**
- **Host:** `db.vwhdihrnifhndvnzglry.supabase.co`
- **Port:** `5432`
- **Database:** `postgres`
- **User:** `postgres`
- **Password:** `[A tua database password - ver em Database Settings]`

---

## 🔧 Configurar Variáveis de Ambiente

Atualiza o ficheiro `.env` do projeto com estas variáveis:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://vwhdihrnifhndvnzglry.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aGRpaHJuaWZobmR2bnpnbHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MzAxMjIsImV4cCI6MjA0NjIwNjEyMn0.evJgc3MiOzJzdXBhYmFzZSI

SUPABASE_URL=https://vwhdihrnifhndvnzglry.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aGRpaHJuaWZobmR2bnpnbHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MzAxMjIsImV4cCI6MjA0NjIwNjEyMn0.evJgc3MiOzJzdXBhYmFzZSI

# Database Connection (Prisma)
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.vwhdihrnifhndvnzglry.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[YOUR_PASSWORD]@db.vwhdihrnifhndvnzglry.supabase.co:5432/postgres

# App Configuration
VITE_APP_ID=proj_organiza_te360
VITE_APP_TITLE=Organiza-te360
VITE_APP_LOGO=https://placehold.co/40x40/a855f7/ffffff?text=O
JWT_SECRET=prod-jwt-secret-change-this-to-random-string-123456789
PORT=3000
```

**⚠️ IMPORTANTE:** Substitui `[YOUR_PASSWORD]` pela password da base de dados que encontras em:
- Dashboard Supabase → Project Settings → Database → Database password

---

## 📊 Criar Schema da Base de Dados

Depois de configurar as variáveis de ambiente, executa:

```bash
# Gerar Prisma Client
pnpm exec prisma generate

# Criar tabelas na base de dados
pnpm exec prisma db push
```

Isto vai criar todas as tabelas necessárias no Supabase baseadas no schema Prisma.

---

## 🧪 Testar Conexão

Para testar se a conexão está a funcionar:

```bash
# Iniciar servidor de desenvolvimento
pnpm dev
```

Se tudo estiver correto, verás:
```
[Database] Cleaned DATABASE_URL
Server running on http://0.0.0.0:3000/
```

---

## 🔐 Obter Database Password

Se não sabes a password da base de dados:

1. Acede ao [Dashboard do Supabase](https://supabase.com/dashboard)
2. Seleciona o projeto **"organiza"**
3. Vai a **Project Settings** → **Database**
4. Clica em **"Reset database password"** para gerar uma nova password
5. **Guarda a password** num local seguro
6. Atualiza o `.env` com a nova password

---

## 📁 Estrutura de Tabelas (Prisma Schema)

O projeto já tem um schema Prisma definido em `prisma/schema.prisma` que inclui tabelas para:

- **Users** - Utilizadores e autenticação
- **Tasks** - Gestão de tarefas
- **Events** - Calendário e eventos
- **Goals** - Objetivos SMART
- **Finances** - Gestão financeira
- **Categories** - Categorias personalizáveis

Todas estas tabelas serão criadas automaticamente quando executares `prisma db push`.

---

## 🚀 Próximos Passos

1. ✅ **Obter database password** do Supabase
2. ✅ **Atualizar `.env`** com todas as credenciais
3. ✅ **Executar `pnpm exec prisma db push`** para criar tabelas
4. ✅ **Testar localmente** com `pnpm dev`
5. ✅ **Fazer deploy** em produção (Vercel, Railway, etc.)

---

## 💡 Dicas

### **Backup da Base de Dados**
O Supabase faz backups automáticos diários no plano Free. Podes aceder aos backups em:
- **Database** → **Backups**

### **Monitorização**
Podes ver logs e métricas em tempo real em:
- **Logs** → Ver logs de queries
- **Reports** → Ver estatísticas de uso

### **Limites do Plano Free**
- **500 MB** de espaço em base de dados
- **1 GB** de transferência de dados/mês
- **50,000** requisições de autenticação/mês
- **2 GB** de armazenamento de ficheiros

Para a maioria dos projetos pessoais, isto é mais do que suficiente!

---

## 🆘 Troubleshooting

### **Erro: "Connection refused"**
- Verifica se a DATABASE_URL está correta
- Verifica se a password está correta
- Verifica se o projeto Supabase está ativo (não pausado)

### **Erro: "SSL required"**
Adiciona `?sslmode=require` ao final da DATABASE_URL:
```
postgresql://postgres:PASSWORD@db.vwhdihrnifhndvnzglry.supabase.co:5432/postgres?sslmode=require
```

### **Erro: "Too many connections"**
O plano Free tem limite de 15 conexões simultâneas. Usa connection pooling:
```
postgresql://postgres:PASSWORD@db.vwhdihrnifhndvnzglry.supabase.co:6543/postgres?pgbouncer=true
```

---

**✅ Configuração do Supabase concluída!**

O teu Organiza-te360 está pronto para usar uma base de dados PostgreSQL profissional e escalável! 🎉
