# 🚀 Guia de Deployment - Render (Gratuito e Permanente)

Este guia mostra como fazer o deployment permanente do **Organiza-te360** no **Render**, uma plataforma gratuita com base de dados PostgreSQL incluída.

---

## ✨ Vantagens do Render

- ✅ **100% Gratuito** (plano Free tier)
- ✅ **Deploy automático** a cada push no GitHub
- ✅ **Base de dados PostgreSQL gratuita** (256MB)
- ✅ **SSL/HTTPS automático**
- ✅ **URL público permanente** (ex: `organiza-te360.onrender.com`)
- ✅ **750 horas/mês grátis** (suficiente para 24/7)
- ✅ **Logs em tempo real**
- ✅ **Fácil configuração** (sem Docker necessário)

---

## 📋 Pré-requisitos

1. Conta GitHub (já tens ✅)
2. Repositório GitHub com o código (já tens ✅)
3. Conta Render (criar em [render.com](https://render.com))

---

## 🎯 Passo a Passo

### **1. Criar Conta no Render**

1. Acede a [render.com](https://render.com)
2. Clica em **"Get Started for Free"**
3. Faz login com a tua conta **GitHub**
4. Autoriza o Render a aceder aos teus repositórios

---

### **2. Criar Base de Dados PostgreSQL**

1. No dashboard do Render, clica em **"New +"**
2. Seleciona **"PostgreSQL"**
3. Configura:
   - **Name:** `organiza-te360-db`
   - **Database:** `organiza_te360`
   - **User:** `organiza_te360_user`
   - **Region:** `Frankfurt (EU Central)` (mais próximo de Portugal)
   - **Plan:** **Free**
4. Clica em **"Create Database"**
5. Aguarda 1-2 minutos até a base de dados estar pronta
6. **IMPORTANTE:** Copia a **Internal Database URL** (vais precisar no próximo passo)

---

### **3. Criar Web Service**

1. No dashboard, clica em **"New +"**
2. Seleciona **"Web Service"**
3. Conecta o repositório:
   - Clica em **"Connect Repository"**
   - Procura por **"poetik97/organiza-te360"**
   - Clica em **"Connect"**

---

### **4. Configurar o Web Service**

Preenche os campos:

#### **Informações Básicas:**
- **Name:** `organiza-te360`
- **Region:** `Frankfurt (EU Central)`
- **Branch:** `main`
- **Runtime:** `Node`
- **Build Command:** `./render-build.sh`
- **Start Command:** `pnpm start`
- **Plan:** **Free**

#### **Variáveis de Ambiente:**

Clica em **"Advanced"** e adiciona estas variáveis:

| Key | Value |
|-----|-------|
| `NODE_VERSION` | `22.13.0` |
| `VITE_APP_ID` | `proj_organiza_te360` |
| `VITE_OAUTH_PORTAL_URL` | `https://vida.butterfly-effect.dev` |
| `VITE_APP_TITLE` | `Organiza-te360` |
| `VITE_APP_LOGO` | `https://placehold.co/40x40/a855f7/ffffff?text=O` |
| `OAUTH_SERVER_URL` | `https://vidabiz.butterfly-effect.dev` |
| `DATABASE_URL` | **(Cola a Internal Database URL da base de dados criada no passo 2)** |
| `JWT_SECRET` | `prod-jwt-secret-change-this-to-random-string-123456789` |
| `PORT` | `3000` |

**Opcional (se tiveres):**
| Key | Value |
|-----|-------|
| `OPENAI_API_KEY` | `sk-xxx...` |
| `VITE_ANALYTICS_ENDPOINT` | `https://...` |
| `VITE_ANALYTICS_WEBSITE_ID` | `analytics_xxx` |

---

### **5. Deploy**

1. Clica em **"Create Web Service"**
2. O Render vai automaticamente:
   - Clonar o repositório
   - Instalar dependências
   - Gerar Prisma Client
   - Fazer build
   - Iniciar o servidor
3. Aguarda **5-10 minutos** (primeiro deploy é mais lento)
4. Quando aparecer **"Live"** em verde, o site está online! 🎉

---

### **6. Migrar Base de Dados**

Após o primeiro deploy, precisas de criar as tabelas na base de dados:

1. No dashboard do Render, vai ao teu **Web Service**
2. Clica no separador **"Shell"**
3. Executa:
   ```bash
   pnpm exec prisma db push
   ```
4. Aguarda a confirmação de que as tabelas foram criadas

**Alternativa (se o Shell não estiver disponível no plano Free):**

Podes executar localmente:
```bash
# No teu computador/Manus
export DATABASE_URL="postgresql://organiza_te360_user:PASSWORD@dpg-xxx.frankfurt-postgres.render.com/organiza_te360"
pnpm exec prisma db push
```

---

## 🌐 Aceder ao Site

O teu site estará disponível em:

**`https://organiza-te360.onrender.com`**

(ou o nome que escolheste)

---

## 🔄 Deploy Automático

A partir de agora, **sempre que fizeres push** para o GitHub:

```bash
git add .
git commit -m "Nova funcionalidade"
git push origin main
```

O Render vai automaticamente:
1. Detetar o push
2. Fazer novo build
3. Fazer deploy da nova versão
4. Trocar para a nova versão sem downtime

---

## 📊 Monitorização

No dashboard do Render podes ver:

- **Logs em tempo real**
- **Métricas de CPU e memória**
- **Histórico de deploys**
- **Status do serviço**

---

## ⚙️ Configurações Avançadas

### **Domínio Personalizado (Opcional)**

1. No Web Service, vai a **"Settings"**
2. Clica em **"Custom Domain"**
3. Adiciona o teu domínio (ex: `organiza-te360.com`)
4. Configura os DNS records conforme indicado
5. SSL automático será configurado

### **Auto-Deploy**

Por padrão está ativo. Para desativar:
1. **Settings → Build & Deploy**
2. Desativa **"Auto-Deploy"**

### **Variáveis de Ambiente**

Para adicionar/editar:
1. **Environment → Environment Variables**
2. Adiciona/edita as variáveis
3. Clica em **"Save Changes"**
4. O serviço vai reiniciar automaticamente

---

## 🐛 Troubleshooting

### **Build falha**

**Erro:** `pnpm: command not found`
- **Solução:** Verifica se `NODE_VERSION` está definido como `22.13.0`

**Erro:** `PrismaClient not found`
- **Solução:** Verifica se o build command inclui `pnpm exec prisma generate`

### **Aplicação não inicia**

**Erro:** `DATABASE_URL is not defined`
- **Solução:** Verifica se a variável `DATABASE_URL` está configurada corretamente

**Erro:** `Port already in use`
- **Solução:** Remove a variável `PORT` ou define como `3000`

### **Base de dados não conecta**

- Verifica se usaste a **Internal Database URL** (não a External)
- Formato: `postgresql://user:password@host.render.com/database`

### **Site muito lento**

O plano Free "hiberna" após 15 minutos de inatividade. O primeiro acesso após hibernação pode demorar 30-60 segundos.

**Soluções:**
- Upgrade para plano pago ($7/mês) para evitar hibernação
- Usar um serviço de "ping" para manter o site ativo (ex: UptimeRobot)

---

## 💰 Limites do Plano Free

- **750 horas/mês** (suficiente para 24/7)
- **512 MB RAM**
- **0.1 CPU**
- **100 GB bandwidth/mês**
- **Base de dados:** 256 MB storage
- **Hibernação:** Após 15 min de inatividade

Para a maioria dos projetos pessoais, isto é mais do que suficiente!

---

## 🔐 Segurança

### **Checklist:**
- [x] HTTPS automático ✅
- [ ] Mudar `JWT_SECRET` para valor forte
- [ ] Configurar rate limiting
- [ ] Adicionar Helmet.js
- [ ] Fazer backups regulares da BD

### **Backup da Base de Dados:**

1. No dashboard, vai à base de dados
2. Clica em **"Connect"**
3. Copia o comando `pg_dump`
4. Executa localmente para fazer backup:
   ```bash
   pg_dump -h dpg-xxx.frankfurt-postgres.render.com -U organiza_te360_user -d organiza_te360 > backup.sql
   ```

---

## 📈 Próximos Passos

Depois do deploy:

1. ✅ Testa todas as funcionalidades
2. ✅ Configura domínio personalizado (opcional)
3. ✅ Adiciona Google Analytics
4. ✅ Configura backups automáticos
5. ✅ Adiciona monitoring (Sentry, LogRocket)
6. ✅ Partilha o link com amigos! 🎉

---

## 🆘 Suporte

- **Documentação Render:** [render.com/docs](https://render.com/docs)
- **Community Forum:** [community.render.com](https://community.render.com)
- **Status Page:** [status.render.com](https://status.render.com)

---

**✅ Deployment concluído? Parabéns! 🎉**

O teu **Organiza-te360** está agora online e acessível a qualquer pessoa no mundo!
