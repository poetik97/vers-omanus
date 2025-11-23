# 🚀 Guia Completo de Deployment no Google Cloud Platform

## 📋 Pré-requisitos

Antes de começar, certifica-te que tens:
- ✅ Conta Google Cloud Platform (geral@organiza-te360.com)
- ✅ Projeto configurado no GCP
- ✅ Billing ativado (necessário para Cloud Run)
- ✅ Código no GitHub (poetik97/organiza-te360)

---

## 🎯 Deployment no Google Cloud Run - Passo a Passo

### **Fase 1: Configurar o Projeto GCP** (5 minutos)

#### **Passo 1.1: Aceder ao Google Cloud Console**
1. Abre o browser e vai a: https://console.cloud.google.com
2. Faz login com: **geral@organiza-te360.com**
3. Password: **Fcporto97!!!**

#### **Passo 1.2: Criar ou Selecionar Projeto**
1. No topo da página, clica no **dropdown do projeto**
2. Se já tens um projeto:
   - Seleciona o projeto existente
3. Se não tens projeto:
   - Clica em **"Novo Projeto"**
   - Nome: **organiza-te360**
   - Clica em **"Criar"**
   - Aguarda 30 segundos até o projeto ser criado

#### **Passo 1.3: Ativar Billing**
1. No menu lateral esquerdo, clica em **"Faturação"** (Billing)
2. Se não tiver billing ativado:
   - Clica em **"Vincular uma conta de faturação"**
   - Segue os passos para adicionar cartão de crédito
   - **Nota:** Google Cloud oferece $300 de créditos grátis para novos utilizadores!

#### **Passo 1.4: Ativar APIs Necessárias**
1. No menu lateral, vai a **"APIs e Serviços" > "Biblioteca"**
2. Procura e ativa as seguintes APIs (clica em cada uma e depois em "Ativar"):
   - ✅ **Cloud Run API**
   - ✅ **Cloud Build API**
   - ✅ **Container Registry API**
   - ✅ **Secret Manager API**

---

### **Fase 2: Configurar Secrets (Variáveis de Ambiente)** (5 minutos)

#### **Passo 2.1: Aceder ao Secret Manager**
1. No menu lateral, vai a **"Security" > "Secret Manager"**
2. Se aparecer para ativar a API, clica em **"Ativar"**

#### **Passo 2.2: Criar Secrets**

Vais criar 5 secrets. Para cada um:

**Secret 1: DATABASE_URL**
1. Clica em **"Criar Secret"**
2. Nome: `DATABASE_URL`
3. Valor: 
   ```
   postgresql://postgres:parchalportimao@db.vwhdihrnifhndvnzglry.supabase.co:6543/postgres?sslmode=require
   ```
4. Clica em **"Criar Secret"**

**Secret 2: DIRECT_URL**
1. Clica em **"Criar Secret"**
2. Nome: `DIRECT_URL`
3. Valor:
   ```
   postgresql://postgres:parchalportimao@db.vwhdihrnifhndvnzglry.supabase.co:5432/postgres?sslmode=require
   ```
4. Clica em **"Criar Secret"**

**Secret 3: SESSION_SECRET**
1. Clica em **"Criar Secret"**
2. Nome: `SESSION_SECRET`
3. Valor: (gera uma string aleatória segura)
   ```
   organiza-te360-super-secret-key-2025-production
   ```
4. Clica em **"Criar Secret"**

**Secret 4: SUPABASE_URL**
1. Clica em **"Criar Secret"**
2. Nome: `SUPABASE_URL`
3. Valor:
   ```
   https://vwhdihrnifhndvnzglry.supabase.co
   ```
4. Clica em **"Criar Secret"**

**Secret 5: SUPABASE_ANON_KEY**
1. Clica em **"Criar Secret"**
2. Nome: `SUPABASE_ANON_KEY`
3. Valor: (copia do Supabase Dashboard > Settings > API)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aGRpaHJuaWZobmR2bnpnbHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MzA2NTksImV4cCI6MjA0NjIwNjY1OX0.evJqc3M1Q1JzdXBhYmFzZS5jbw
   ```
4. Clica em **"Criar Secret"**

---

### **Fase 3: Conectar GitHub ao Cloud Build** (3 minutos)

#### **Passo 3.1: Aceder ao Cloud Build**
1. No menu lateral, vai a **"Cloud Build" > "Triggers"**
2. Se aparecer para ativar a API, clica em **"Ativar"**

#### **Passo 3.2: Conectar Repositório GitHub**
1. Clica em **"Conectar Repositório"**
2. Seleciona **"GitHub (Cloud Build GitHub App)"**
3. Clica em **"Continuar"**
4. Autoriza o Google Cloud a aceder ao GitHub
5. Seleciona o repositório: **poetik97/organiza-te360**
6. Clica em **"Conectar"**

#### **Passo 3.3: Criar Trigger de Deploy Automático**
1. Clica em **"Criar Trigger"**
2. Configurações:
   - **Nome:** `deploy-organiza-te360`
   - **Descrição:** `Deploy automático para Cloud Run`
   - **Evento:** `Push para um branch`
   - **Repositório:** `poetik97/organiza-te360`
   - **Branch:** `^main$` (ou `^master$` se usares master)
   - **Tipo de configuração:** `Cloud Build configuration file (yaml or json)`
   - **Localização:** `/ cloudbuild.yaml`
3. Clica em **"Criar"**

---

### **Fase 4: Fazer o Primeiro Deploy** (10 minutos)

#### **Opção A: Deploy via Cloud Build (Automático)**

1. Faz um pequeno commit no GitHub:
   ```bash
   git commit --allow-empty -m "Trigger Cloud Build deploy"
   git push origin main
   ```

2. Volta ao Cloud Build > Histórico
3. Aguarda o build completar (5-10 minutos)
4. Se der erro, verifica os logs e ajusta

#### **Opção B: Deploy Manual via Cloud Shell (Recomendado para primeiro deploy)**

1. No Google Cloud Console, clica no ícone **">_"** (Cloud Shell) no topo direito
2. Aguarda o terminal abrir
3. Executa os seguintes comandos:

```bash
# 1. Clonar o repositório
git clone https://github.com/poetik97/organiza-te360.git
cd organiza-te360

# 2. Configurar o projeto
gcloud config set project [SEU_PROJECT_ID]

# 3. Build da imagem Docker
gcloud builds submit --tag gcr.io/[SEU_PROJECT_ID]/organiza-te360

# 4. Deploy no Cloud Run
gcloud run deploy organiza-te360 \
  --image gcr.io/[SEU_PROJECT_ID]/organiza-te360 \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production,PORT=8080" \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,DIRECT_URL=DIRECT_URL:latest,SESSION_SECRET=SESSION_SECRET:latest,SUPABASE_URL=SUPABASE_URL:latest,SUPABASE_ANON_KEY=SUPABASE_ANON_KEY:latest"
```

**Substitui `[SEU_PROJECT_ID]` pelo ID do teu projeto!**

Para ver o PROJECT_ID:
```bash
gcloud config get-value project
```

---

### **Fase 5: Configurar Domínio Personalizado** (Opcional - 5 minutos)

#### **Passo 5.1: Obter URL do Cloud Run**
1. Vai a **"Cloud Run" > "Serviços"**
2. Clica em **"organiza-te360"**
3. Copia o **URL** (algo como: `https://organiza-te360-xxx-ew.a.run.app`)

#### **Passo 5.2: Adicionar Domínio Personalizado**
1. Na página do serviço, clica em **"Gerenciar domínios personalizados"**
2. Clica em **"Adicionar mapeamento"**
3. Seleciona o serviço: **organiza-te360**
4. Domínio: **organiza-te360.com** (ou subdomínio)
5. Segue as instruções para configurar DNS

---

### **Fase 6: Atualizar Supabase URLs** (2 minutos)

#### **Passo 6.1: Atualizar Site URL no Supabase**
1. Acede a: https://supabase.com/dashboard
2. Vai ao projeto **organiza**
3. **Settings > Authentication > URL Configuration**
4. **Site URL:** Atualiza para o URL do Cloud Run
   ```
   https://organiza-te360-xxx-ew.a.run.app
   ```
5. **Redirect URLs:** Adiciona:
   ```
   https://organiza-te360-xxx-ew.a.run.app/**
   ```
6. Clica em **"Save"**

---

## 🎉 Deployment Completo!

### **Verificar se está a funcionar:**

1. Abre o URL do Cloud Run no browser
2. Testa o login com Google
3. Testa criar uma transação
4. Verifica se tudo funciona perfeitamente!

---

## 📊 Monitorização e Logs

### **Ver Logs:**
1. Vai a **"Cloud Run" > "Serviços" > "organiza-te360"**
2. Clica em **"Logs"**
3. Vê os logs em tempo real

### **Ver Métricas:**
1. Na mesma página, clica em **"Métricas"**
2. Vê requests, latência, erros, etc.

---

## 💰 Custos Estimados

### **Cloud Run (Free Tier):**
- ✅ **2 milhões de requests/mês** - GRÁTIS
- ✅ **360,000 GB-segundos/mês** - GRÁTIS
- ✅ **180,000 vCPU-segundos/mês** - GRÁTIS

### **Após Free Tier:**
- **Requests:** $0.40 por milhão
- **CPU:** $0.00002400 por vCPU-segundo
- **Memória:** $0.00000250 por GB-segundo

**Estimativa mensal (uso moderado):** $0-5/mês

---

## 🔧 Troubleshooting

### **Problema: Build falha**
**Solução:**
1. Verifica os logs no Cloud Build
2. Certifica-te que o Dockerfile está correto
3. Verifica se todas as dependências estão no package.json

### **Problema: Deploy falha**
**Solução:**
1. Verifica se os secrets estão criados corretamente
2. Verifica se as APIs estão ativadas
3. Verifica os logs do Cloud Run

### **Problema: Aplicação não inicia**
**Solução:**
1. Verifica os logs do Cloud Run
2. Certifica-te que a porta 8080 está configurada
3. Verifica se o DATABASE_URL está correto

### **Problema: Erro 500 ao criar transação**
**Solução:**
1. Verifica se o Prisma consegue conectar ao Supabase
2. Verifica os logs para ver o erro exato
3. Testa a conexão com: `npx prisma db push`

---

## 📁 Ficheiros Importantes

- ✅ `Dockerfile` - Configuração Docker
- ✅ `cloudbuild.yaml` - Configuração Cloud Build
- ✅ `.dockerignore` - Ficheiros a ignorar no build
- ✅ `package.json` - Dependências e scripts

---

## 🎯 Próximos Passos

Depois do deployment:

1. ✅ **Configurar domínio personalizado** (organiza-te360.com)
2. ✅ **Configurar CI/CD** (deploy automático a cada push)
3. ✅ **Configurar monitoring** (alertas, métricas)
4. ✅ **Configurar backups** (base de dados)
5. ✅ **Otimizar performance** (CDN, caching)

---

## 📞 Suporte

Se tiveres problemas:
1. Verifica os logs no Cloud Run
2. Verifica o troubleshooting acima
3. Consulta a documentação: https://cloud.google.com/run/docs

---

**Criado:** 3 de novembro de 2025  
**Versão:** 1.0  
**Status:** Pronto para deployment

---

## ✅ Checklist Final

Antes de fazer deploy, certifica-te:

- [ ] Projeto GCP criado
- [ ] Billing ativado
- [ ] APIs ativadas (Cloud Run, Cloud Build, Container Registry, Secret Manager)
- [ ] Secrets criados (DATABASE_URL, DIRECT_URL, SESSION_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY)
- [ ] GitHub conectado ao Cloud Build
- [ ] Trigger criado (opcional, para deploy automático)
- [ ] Dockerfile verificado
- [ ] cloudbuild.yaml verificado

**Depois do deploy:**

- [ ] URL do Cloud Run obtido
- [ ] Site URL atualizado no Supabase
- [ ] Redirect URLs atualizados no Supabase
- [ ] Login testado
- [ ] Transações testadas
- [ ] Tudo funciona! 🎉
