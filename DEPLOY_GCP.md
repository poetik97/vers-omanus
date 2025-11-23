# 🚀 Deploy no Google Cloud Platform - Organiza-te360

Guia completo para fazer deploy do Organiza-te360 no **Google Cloud Run**.

---

## 📋 Pré-requisitos

1. **Conta Google Cloud** - [Criar conta](https://cloud.google.com/)
2. **Projeto GCP criado** - [Console GCP](https://console.cloud.google.com/)
3. **gcloud CLI instalado** - [Instalar gcloud](https://cloud.google.com/sdk/docs/install)
4. **Docker instalado** (opcional, para testes locais)
5. **Base de dados Supabase** configurada

---

## 🎯 Opção 1: Deploy Manual via gcloud CLI

### **Passo 1: Configurar gcloud**

```bash
# Login no Google Cloud
gcloud auth login

# Definir projeto
gcloud config set project SEU-PROJECT-ID

# Ativar APIs necessárias
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### **Passo 2: Criar Secrets**

Armazene variáveis sensíveis no Secret Manager:

```bash
# DATABASE_URL
echo -n "postgresql://postgres.xxx:PASSWORD@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true" | \
  gcloud secrets create DATABASE_URL --data-file=-

# DIRECT_URL
echo -n "postgresql://postgres.xxx:PASSWORD@aws-1-eu-north-1.pooler.supabase.com:5432/postgres" | \
  gcloud secrets create DIRECT_URL --data-file=-

# JWT_SECRET
echo -n "your-super-secret-jwt-key-change-in-production" | \
  gcloud secrets create JWT_SECRET --data-file=-

# SUPABASE_URL
echo -n "https://xxx.supabase.co" | \
  gcloud secrets create SUPABASE_URL --data-file=-

# SUPABASE_ANON_KEY
echo -n "eyJxxx..." | \
  gcloud secrets create SUPABASE_ANON_KEY --data-file=-

# OPENAI_API_KEY (opcional)
echo -n "sk-xxx..." | \
  gcloud secrets create OPENAI_API_KEY --data-file=-
```

### **Passo 3: Build e Deploy**

```bash
# Build da imagem Docker e deploy para Cloud Run
gcloud run deploy organiza-te360 \
  --source . \
  --region europe-west1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --port 8080 \
  --set-env-vars NODE_ENV=production \
  --set-secrets DATABASE_URL=DATABASE_URL:latest,DIRECT_URL=DIRECT_URL:latest,JWT_SECRET=JWT_SECRET:latest,SUPABASE_URL=SUPABASE_URL:latest,SUPABASE_ANON_KEY=SUPABASE_ANON_KEY:latest
```

**Aguarde ~5 minutos** para o build e deploy completarem.

### **Passo 4: Obter URL**

Após o deploy, você receberá uma URL pública:

```
Service [organiza-te360] revision [organiza-te360-00001-xxx] has been deployed and is serving 100 percent of traffic.
Service URL: https://organiza-te360-xxxxx-ew.a.run.app
```

**Pronto! Seu site está no ar!** 🎉

---

## 🤖 Opção 2: Deploy Automático via GitHub (CI/CD)

### **Passo 1: Conectar GitHub ao Google Cloud**

1. Acesse [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Clique em **"Connect Repository"**
3. Selecione **GitHub** e autorize
4. Selecione o repositório `poetik97/organiza-te360`

### **Passo 2: Criar Trigger**

1. Clique em **"Create Trigger"**
2. Configure:
   - **Nome:** `deploy-organiza-te360`
   - **Event:** Push to branch
   - **Branch:** `^main$`
   - **Configuration:** Cloud Build configuration file (yaml or json)
   - **Location:** `/cloudbuild.yaml`

3. Clique em **"Create"**

### **Passo 3: Criar Secrets (mesmo que Opção 1)**

Execute os comandos do **Passo 2 da Opção 1** para criar os secrets.

### **Passo 4: Dar Permissões ao Cloud Build**

```bash
# Obter número do projeto
PROJECT_NUMBER=$(gcloud projects describe SEU-PROJECT-ID --format="value(projectNumber)")

# Dar permissão de Cloud Run Admin
gcloud projects add-iam-policy-binding SEU-PROJECT-ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

# Dar permissão de Service Account User
gcloud projects add-iam-policy-binding SEU-PROJECT-ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Dar permissão de Secret Manager Accessor
gcloud projects add-iam-policy-binding SEU-PROJECT-ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### **Passo 5: Push para GitHub**

Agora, **qualquer push para a branch `main`** fará deploy automático!

```bash
git add .
git commit -m "feat: configuração de deploy GCP"
git push origin main
```

Acompanhe o build em: [Cloud Build History](https://console.cloud.google.com/cloud-build/builds)

---

## 🐳 Opção 3: Deploy via Google Cloud Console (Interface Gráfica)

### **Passo 1: Acessar Cloud Run**

1. Acesse [Cloud Run Console](https://console.cloud.google.com/run)
2. Clique em **"Create Service"**

### **Passo 2: Configurar Serviço**

**Container:**
- **Deployment platform:** Cloud Run (fully managed)
- **Region:** europe-west1 (Bélgica) ou europe-west4 (Holanda)

**Container image URL:**
- Clique em **"Deploy one revision from an existing container image"**
- Ou clique em **"Continuously deploy from a repository (source or function)"**
  - Conecte ao GitHub
  - Selecione `poetik97/organiza-te360`
  - Branch: `main`
  - Build type: Dockerfile

**Service settings:**
- **Service name:** `organiza-te360`
- **Authentication:** Allow unauthenticated invocations
- **CPU allocation:** CPU is only allocated during request processing
- **Minimum instances:** 0
- **Maximum instances:** 10
- **Memory:** 512 MiB
- **CPU:** 1
- **Request timeout:** 300 seconds
- **Maximum concurrent requests:** 80

**Variables & Secrets:**

Clique em **"Container, Variables & Secrets, Connections, Security"**

Adicione as variáveis de ambiente:
- `NODE_ENV` = `production`
- `PORT` = `8080`

Adicione os secrets (crie-os primeiro no Secret Manager):
- `DATABASE_URL` → Reference: `DATABASE_URL:latest`
- `DIRECT_URL` → Reference: `DIRECT_URL:latest`
- `JWT_SECRET` → Reference: `JWT_SECRET:latest`
- `SUPABASE_URL` → Reference: `SUPABASE_URL:latest`
- `SUPABASE_ANON_KEY` → Reference: `SUPABASE_ANON_KEY:latest`

### **Passo 3: Deploy**

Clique em **"Create"** e aguarde ~5 minutos.

---

## 💰 Custos Estimados

### **Cloud Run (Pay-per-use):**

**Tier Gratuito (sempre):**
- 2 milhões de requests/mês
- 360.000 GB-segundos de memória
- 180.000 vCPU-segundos

**Exemplo de uso médio (após tier gratuito):**
- 100.000 requests/mês
- Tempo médio: 200ms/request
- Memória: 512 MB
- **Custo: ~€2-5/mês**

**Comparação:**
- Vercel: Grátis (hobby) ou $20/mês (pro)
- Heroku: $7/mês (básico)
- AWS Fargate: ~$15-30/mês
- **Cloud Run: €2-5/mês** ✅ Mais barato!

---

## 🔧 Configurações Avançadas

### **Custom Domain (Domínio Personalizado)**

```bash
# Mapear domínio
gcloud run domain-mappings create \
  --service organiza-te360 \
  --domain app.organiza-te360.com \
  --region europe-west1
```

Depois, configure os registos DNS conforme instruído.

### **Escala Automática**

```bash
# Atualizar configurações de escala
gcloud run services update organiza-te360 \
  --min-instances 1 \
  --max-instances 100 \
  --cpu 2 \
  --memory 1Gi \
  --region europe-west1
```

### **Logs e Monitorização**

**Ver logs em tempo real:**
```bash
gcloud run services logs tail organiza-te360 --region europe-west1
```

**Acessar logs no console:**
[Cloud Logging](https://console.cloud.google.com/logs)

**Métricas:**
[Cloud Monitoring](https://console.cloud.google.com/monitoring)

### **Rollback para Versão Anterior**

```bash
# Listar revisões
gcloud run revisions list --service organiza-te360 --region europe-west1

# Fazer rollback
gcloud run services update-traffic organiza-te360 \
  --to-revisions REVISION_NAME=100 \
  --region europe-west1
```

---

## 🔐 Segurança

### **Ativar Cloud Armor (Proteção DDoS)**

```bash
# Criar política de segurança
gcloud compute security-policies create organiza-te360-policy \
  --description "Proteção DDoS para Organiza-te360"

# Aplicar regras
gcloud compute security-policies rules create 1000 \
  --security-policy organiza-te360-policy \
  --expression "origin.region_code == 'CN'" \
  --action "deny-403"
```

### **Ativar SSL/TLS**

Cloud Run já inclui SSL/TLS automático! ✅

### **Limitar Acesso por IP (opcional)**

```bash
# Criar regra de firewall
gcloud run services update organiza-te360 \
  --ingress internal-and-cloud-load-balancing \
  --region europe-west1
```

---

## 📊 Monitorização e Alertas

### **Configurar Alertas**

1. Acesse [Cloud Monitoring](https://console.cloud.google.com/monitoring/alerting)
2. Clique em **"Create Policy"**
3. Configure alertas para:
   - Latência > 1s
   - Taxa de erro > 5%
   - CPU > 80%
   - Memória > 90%

### **Uptime Checks**

```bash
# Criar uptime check
gcloud monitoring uptime create organiza-te360-check \
  --display-name="Organiza-te360 Uptime" \
  --resource-type=uptime-url \
  --host=organiza-te360-xxxxx-ew.a.run.app \
  --path=/
```

---

## 🐛 Troubleshooting

### **Erro: "Container failed to start"**

**Solução:** Verifique os logs:
```bash
gcloud run services logs read organiza-te360 --region europe-west1 --limit 50
```

### **Erro: "Secret not found"**

**Solução:** Verifique se os secrets foram criados:
```bash
gcloud secrets list
```

### **Erro: "Permission denied"**

**Solução:** Dê permissões ao Cloud Build:
```bash
gcloud projects add-iam-policy-binding SEU-PROJECT-ID \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"
```

### **Erro: "Database connection failed"**

**Solução:** Verifique se a `DATABASE_URL` está correta:
```bash
gcloud secrets versions access latest --secret="DATABASE_URL"
```

---

## 🎯 Checklist de Deploy

- [ ] Conta Google Cloud criada
- [ ] Projeto GCP criado
- [ ] gcloud CLI instalado e configurado
- [ ] APIs ativadas (Cloud Run, Cloud Build, Secret Manager)
- [ ] Secrets criados (DATABASE_URL, JWT_SECRET, etc.)
- [ ] Dockerfile testado localmente (opcional)
- [ ] Deploy executado com sucesso
- [ ] URL pública funcionando
- [ ] Domínio personalizado configurado (opcional)
- [ ] Monitorização e alertas configurados
- [ ] Backup da base de dados configurado

---

## 🆘 Suporte

**Documentação Oficial:**
- [Cloud Run Docs](https://cloud.google.com/run/docs)
- [Cloud Build Docs](https://cloud.google.com/build/docs)
- [Secret Manager Docs](https://cloud.google.com/secret-manager/docs)

**Comunidade:**
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-cloud-run)
- [Google Cloud Community](https://www.googlecloudcommunity.com/)

---

**✅ Deploy concluído? Parabéns! Seu Organiza-te360 está no ar! 🎉**

**URL de exemplo:** `https://organiza-te360-xxxxx-ew.a.run.app`

