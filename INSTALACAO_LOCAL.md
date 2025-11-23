# 🚀 Guia de Instalação Local - Organiza-te360

Este guia irá ajudá-lo a executar o **Organiza-te360** localmente no seu computador.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de que tem instalado:

1. **Node.js** (versão 18 ou superior)
   - Download: https://nodejs.org/
   - Verifique: `node --version`

2. **pnpm** (gestor de pacotes)
   - Instalar: `npm install -g pnpm`
   - Verifique: `pnpm --version`

3. **Git** (opcional, mas recomendado)
   - Download: https://git-scm.com/

---

## 📦 Passo 1: Extrair o Projeto

1. Extraia o arquivo `organiza-te360-completo.zip` para uma pasta no seu computador
2. Abra um terminal/prompt de comando na pasta extraída

```bash
cd caminho/para/organiza-te360
```

---

## 🔧 Passo 2: Instalar Dependências

Execute o seguinte comando para instalar todas as dependências:

```bash
pnpm install
```

**Nota:** Este processo pode demorar alguns minutos na primeira vez.

---

## 🗄️ Passo 3: Configurar Base de Dados

O projeto já está configurado para usar **Supabase** (PostgreSQL na cloud). As credenciais já estão no arquivo `.env`.

**Opção A: Usar a base de dados existente (Recomendado)**
- Não precisa fazer nada! O arquivo `.env` já tem as credenciais configuradas.

**Opção B: Criar sua própria base de dados Supabase**
1. Crie uma conta em https://supabase.com
2. Crie um novo projeto
3. Copie as credenciais de conexão
4. Edite o arquivo `.env` e substitua:
   ```
   DATABASE_URL="sua-connection-string-aqui"
   DIRECT_URL="sua-direct-connection-string-aqui"
   ```

---

## 🔑 Passo 4: Configurar Variáveis de Ambiente

O arquivo `.env` já está incluído com as seguintes variáveis:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# OpenAI API (para funcionalidades de IA)
OPENAI_API_KEY="sk-..."

# Session Secret
SESSION_SECRET="seu-secret-aqui"

# Environment
NODE_ENV="development"
```

**Importante:** Se quiser usar as funcionalidades de IA (Assistente, Análise de Sentimento, Previsões), você precisa de uma chave da OpenAI:
1. Crie uma conta em https://platform.openai.com
2. Gere uma API key
3. Substitua `OPENAI_API_KEY` no arquivo `.env`

**Nota:** As funcionalidades básicas funcionam sem a API key da OpenAI.

---

## 🗃️ Passo 5: Criar Tabelas na Base de Dados

Execute as migrações do Prisma para criar as tabelas:

```bash
pnpm prisma:migrate
```

Ou, se preferir apenas sincronizar o schema:

```bash
pnpm prisma:push
```

Para visualizar a base de dados (opcional):

```bash
pnpm prisma:studio
```

Isto abrirá uma interface web em `http://localhost:5555` onde pode ver e editar os dados.

---

## ▶️ Passo 6: Executar o Projeto

### Modo Desenvolvimento (Recomendado)

Execute o servidor de desenvolvimento:

```bash
pnpm dev
```

Isto irá:
- Iniciar o backend na porta 3000
- Iniciar o frontend com hot-reload
- Abrir automaticamente o browser em `http://localhost:5173`

**URLs:**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **tRPC Playground:** http://localhost:3000/trpc

### Modo Produção

Para testar em modo produção:

```bash
# Build do projeto
pnpm build

# Executar versão de produção
pnpm start
```

---

## 🎯 Passo 7: Testar a Aplicação

1. Abra o browser em `http://localhost:5173`
2. Faça login (ou crie uma conta se necessário)
3. Teste as funcionalidades:
   - ✅ Dashboard
   - ✅ Tarefas
   - ✅ Calendário
   - ✅ Finanças
   - ✅ Objetivos
   - ✅ Diário
   - ✅ Ciclo Menstrual
   - ✅ Relatórios
   - ✅ Assistente IA

---

## 📁 Estrutura do Projeto

```
organiza-te360/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Utilitários e configurações
│   │   └── App.tsx        # Componente principal
│   └── index.html
│
├── server/                 # Backend Express + tRPC
│   ├── routers/           # API endpoints
│   │   ├── tasks.ts       # CRUD de tarefas
│   │   ├── events.ts      # CRUD de eventos
│   │   ├── transactions.ts # CRUD de transações
│   │   ├── goals.ts       # CRUD de objetivos
│   │   ├── diary.ts       # CRUD de diário
│   │   ├── menstrual.ts   # CRUD de ciclo menstrual
│   │   ├── reports.ts     # Relatórios e analytics
│   │   └── ai.ts          # Assistente IA
│   ├── db.ts              # Configuração Prisma
│   └── routers.ts         # Router principal
│
├── prisma/
│   └── schema.prisma      # Schema da base de dados
│
├── .env                   # Variáveis de ambiente
├── package.json           # Dependências
├── tsconfig.json          # Configuração TypeScript
└── vite.config.ts         # Configuração Vite

```

---

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev                    # Executar em modo desenvolvimento
pnpm dev:client            # Apenas frontend
pnpm dev:server            # Apenas backend

# Build
pnpm build                 # Build completo (client + server)
pnpm build:client          # Build apenas frontend
pnpm build:server          # Build apenas backend

# Produção
pnpm start                 # Executar versão de produção

# Base de Dados
pnpm prisma:migrate        # Executar migrações
pnpm prisma:push           # Sincronizar schema
pnpm prisma:studio         # Interface visual da DB
pnpm prisma:generate       # Gerar Prisma Client

# Qualidade de Código
pnpm lint                  # Verificar código
pnpm type-check            # Verificar tipos TypeScript
```

---

## 🔍 Troubleshooting

### Problema: "Cannot find module 'xyz'"
**Solução:** Execute `pnpm install` novamente

### Problema: "Port 3000 already in use"
**Solução:** Feche outros processos na porta 3000 ou altere a porta em `server/index.ts`

### Problema: "Database connection failed"
**Solução:** Verifique se as credenciais no `.env` estão corretas

### Problema: "OpenAI API error"
**Solução:** Verifique se `OPENAI_API_KEY` está configurada corretamente no `.env`

### Problema: Página em branco no browser
**Solução:** 
1. Verifique se o backend está a correr (`http://localhost:3000`)
2. Limpe a cache do browser (Ctrl+Shift+Delete)
3. Execute `pnpm dev` novamente

### Problema: Erro de CORS
**Solução:** O CORS já está configurado no backend. Se persistir, verifique se está a usar `http://localhost:5173` (não `127.0.0.1`)

---

## 📚 Documentação Adicional

- **API_DOCUMENTATION.md** - Documentação completa de todos os 63+ endpoints
- **FINAL_STATUS_REPORT.md** - Relatório final do projeto
- **DIARY_IMPLEMENTACAO.md** - Implementação do Diário
- **MENSTRUAL_REPORTS_IMPLEMENTACAO.md** - Implementação do Ciclo Menstrual
- **FRONTEND_100_PERCENT.md** - Atualizações do frontend

---

## 🌐 Deployment em Produção

O projeto está configurado para deployment no **Vercel**:

1. Crie uma conta em https://vercel.com
2. Conecte o repositório GitHub
3. Configure as variáveis de ambiente no dashboard Vercel
4. Deploy automático a cada push!

**URL de Produção:** https://organiza-te360.vercel.app

---

## 💡 Dicas

1. **Hot Reload:** Em modo desenvolvimento, as alterações no código são aplicadas automaticamente
2. **Prisma Studio:** Use `pnpm prisma:studio` para visualizar e editar dados facilmente
3. **DevTools:** Use as DevTools do browser (F12) para debug
4. **Console:** Verifique o console do terminal para logs do backend
5. **Network Tab:** Use a aba Network das DevTools para ver as chamadas API

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique a secção **Troubleshooting** acima
2. Consulte a documentação em `/API_DOCUMENTATION.md`
3. Verifique os logs no terminal
4. Verifique o console do browser (F12)

---

## ✅ Checklist de Instalação

- [ ] Node.js instalado (v18+)
- [ ] pnpm instalado
- [ ] Projeto extraído
- [ ] Dependências instaladas (`pnpm install`)
- [ ] Arquivo `.env` configurado
- [ ] Migrações executadas (`pnpm prisma:migrate`)
- [ ] Servidor de desenvolvimento a correr (`pnpm dev`)
- [ ] Browser aberto em `http://localhost:5173`
- [ ] Login realizado com sucesso
- [ ] Funcionalidades testadas

---

## 🎉 Pronto!

Agora você tem o **Organiza-te360** a correr localmente no seu computador!

**Próximos passos:**
1. Explore todas as funcionalidades
2. Crie tarefas, eventos, objetivos
3. Experimente o Assistente IA
4. Veja os relatórios e analytics

**Divirta-se e seja produtivo! 🚀**

---

**Desenvolvido com ❤️**  
**Versão:** 1.0.0  
**Data:** Novembro 2025
