# 🚀 Deployment no Google Cloud Run via Cloud Shell

## 📋 Comandos para Executar

Copia e cola estes comandos **um de cada vez** no Cloud Shell:

---

### **Passo 1: Clonar o Repositório**

```bash
# Limpar deployment anterior (se existir)
rm -rf organiza-te360

# Clonar repositório
git clone https://github.com/poetik97/organiza-te360.git
cd organiza-te360
```

---

### **Passo 2: Criar Secrets no Secret Manager**

```bash
# Ativar Secret Manager API (se ainda não estiver ativa)
gcloud services enable secretmanager.googleapis.com

# Criar secrets
echo -n "postgresql://postgres:parchalportimao@db.vwhdihrnifhndvnzglry.supabase.co:6543/postgres?sslmode=require" | gcloud secrets create DATABASE_URL --data-file=- --replication-policy="automatic" || echo "DATABASE_URL já existe"

echo -n "postgresql://postgres:parchalportimao@db.vwhdihrnifhndvnzglry.supabase.co:5432/postgres?sslmode=require" | gcloud secrets create DIRECT_URL --data-file=- --replication-policy="automatic" || echo "DIRECT_URL já existe"

echo -n "organiza-te360-super-secret-key-2025-production" | gcloud secrets create SESSION_SECRET --data-file=- --replication-policy="automatic" || echo "SESSION_SECRET já existe"

echo -n "https://vwhdihrnifhndvnzglry.supabase.co" | gcloud secrets create SUPABASE_URL --data-file=- --replication-policy="automatic" || echo "SUPABASE_URL já existe"

echo -n "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aGRpaHJuaWZobmR2bnpnbHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MzA2NTksImV4cCI6MjA0NjIwNjY1OX0.evJqc3M1Q1JzdXBhYmFzZS5jbw" | gcloud secrets create SUPABASE_ANON_KEY --data-file=- --replication-policy="automatic" || echo "SUPABASE_ANON_KEY já existe"

echo "✅ Secrets criados!"
```

---

### **Passo 3: Build da Imagem Docker**

```bash
# Obter PROJECT_ID
export PROJECT_ID=$(gcloud config get-value project)
echo "📦 Project ID: $PROJECT_ID"

# Build da imagem (pode demorar 5-10 minutos)
gcloud builds submit --tag gcr.io/$PROJECT_ID/organiza-te360
```

**⏳ Aguarda o build completar... (5-10 minutos)**

---

### **Passo 4: Deploy no Cloud Run**

```bash
# Deploy no Cloud Run
gcloud run deploy organiza-te360 \
  --image gcr.io/$PROJECT_ID/organiza-te360 \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 2 \
  --timeout 300 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production,PORT=8080" \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,DIRECT_URL=DIRECT_URL:latest,SESSION_SECRET=SESSION_SECRET:latest,SUPABASE_URL=SUPABASE_URL:latest,SUPABASE_ANON_KEY=SUPABASE_ANON_KEY:latest"
```

**⏳ Aguarda o deploy completar... (2-3 minutos)**

---

### **Passo 5: Obter URL do Serviço**

```bash
# Obter URL
SERVICE_URL=$(gcloud run services describe organiza-te360 --platform managed --region europe-west1 --format 'value(status.url)')

echo ""
echo "🎉 Deployment completo!"
echo "========================"
echo ""
echo "✅ URL da aplicação: $SERVICE_URL"
echo ""
echo "📋 Próximos passos:"
echo "  1. Acede ao URL acima para testar"
echo "  2. Atualiza o Site URL no Supabase com: $SERVICE_URL"
echo ""
```

---

## 🎉 Depois do Deployment

### **Atualizar Supabase:**

1. Vai a: https://supabase.com/dashboard/project/vwhdihrnifhndvnzglry/auth/url-configuration
2. **Site URL:** Cola o URL que apareceu no terminal
3. **Redirect URLs:** Adiciona o URL + `/**`
4. Clica em **"Save"**

### **Testar:**

1. Abre o URL no browser
2. Faz login com Google
3. Testa criar uma transação
4. ✅ Deve funcionar perfeitamente!

---

## 🔧 Troubleshooting

### **Se o build falhar:**

```bash
# Ver logs do build
gcloud builds list --limit=1
gcloud builds log [BUILD_ID]
```

### **Se o deploy falhar:**

```bash
# Ver logs do serviço
gcloud run services logs read organiza-te360 --region europe-west1 --limit=50
```

### **Se o serviço não iniciar:**

```bash
# Aumentar memória e timeout
gcloud run services update organiza-te360 \
  --region europe-west1 \
  --memory 2Gi \
  --timeout 600
```

---

## 📊 Monitorização

### **Ver logs em tempo real:**

```bash
gcloud run services logs tail organiza-te360 --region europe-west1
```

### **Ver métricas:**

```bash
gcloud run services describe organiza-te360 --region europe-west1
```

---

## 💰 Custos

**Configuração atual:**
- **Memória:** 1GB
- **CPU:** 2 vCPUs
- **Timeout:** 300 segundos
- **Min instances:** 0 (escala para zero quando não usado)

**Estimativa mensal (uso moderado):** $5-15/mês

**Free tier:** Primeiros 2 milhões de requests/mês são grátis!

---

**Boa sorte! 🚀**
