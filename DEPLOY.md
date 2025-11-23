# 🚀 Guia de Deployment - Organiza-te360

Este documento contém instruções detalhadas para fazer deploy do Organiza-te360 em diferentes plataformas.

---

## 📋 Pré-requisitos

Antes de fazer deploy, certifique-se de ter:

- ✅ Conta Supabase configurada
- ✅ Base de dados criada e migrada (`pnpm db:push`)
- ✅ Todas as variáveis de ambiente configuradas
- ✅ Build testado localmente (`pnpm build && pnpm start`)

---

## 🌐 Deploy Web (Vercel) - **RECOMENDADO**

### **Porquê Vercel?**
- ✅ Deploy automático a cada push
- ✅ Preview deployments para cada PR
- ✅ Edge functions globais
- ✅ SSL automático
- ✅ 100GB bandwidth grátis/mês

### **Passo a Passo:**

#### **1. Preparar Repositório GitHub**
```bash
# Inicializar git (se ainda não tiver)
git init
git add .
git commit -m "Initial commit"

# Criar repositório no GitHub e fazer push
git remote add origin https://github.com/seu-usuario/organiza-te360.git
git branch -M main
git push -u origin main
```

#### **2. Conectar ao Vercel**
1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"New Project"**
3. Importe o repositório GitHub
4. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `pnpm build`
   - **Output Directory:** `dist/client`
   - **Install Command:** `pnpm install`

#### **3. Configurar Variáveis de Ambiente**

No dashboard do Vercel, vá para **Settings → Environment Variables** e adicione:

```env
# Database
DATABASE_URL=postgresql://postgres.xxx:PASSWORD@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxx:PASSWORD@aws-1-eu-north-1.pooler.supabase.com:5432/postgres

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# OpenAI (opcional)
OPENAI_API_KEY=sk-xxx...

# Resend (opcional)
RESEND_API_KEY=re_xxx...

# App Config
VITE_APP_TITLE=Organiza-te360
VITE_APP_LOGO=https://seu-dominio.com/logo.png
PORT=3000
```

#### **4. Deploy**
Clique em **"Deploy"** e aguarde ~2 minutos!

Seu site estará disponível em: `https://organiza-te360.vercel.app`

---

## 🌊 Deploy Web (Netlify) - **ALTERNATIVA**

### **Passo a Passo:**

#### **1. Instalar Netlify CLI**
```bash
npm install -g netlify-cli
```

#### **2. Login**
```bash
netlify login
```

#### **3. Inicializar Projeto**
```bash
netlify init
```

Selecione:
- **Build command:** `pnpm build`
- **Publish directory:** `dist/client`

#### **4. Configurar Variáveis de Ambiente**
```bash
netlify env:set DATABASE_URL "postgresql://..."
netlify env:set SUPABASE_URL "https://..."
# ... adicione todas as variáveis
```

#### **5. Deploy**
```bash
netlify deploy --prod
```

---

## 🐳 Deploy com Docker

### **Dockerfile**

Crie um `Dockerfile` na raiz do projeto:

```dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar package.json
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código
COPY . .

# Build
RUN pnpm build

# Produção
FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["pnpm", "start"]
```

### **docker-compose.yml**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    restart: unless-stopped
```

### **Deploy**
```bash
docker-compose up -d
```

---

## 📱 Deploy Android APK

### **Pré-requisitos**
- Android Studio instalado
- JDK 17+
- Android SDK

### **Passo a Passo:**

#### **1. Build do Projeto Web**
```bash
pnpm build
```

#### **2. Sincronizar com Capacitor**
```bash
npx cap sync android
```

#### **3. Abrir Android Studio**
```bash
npx cap open android
```

#### **4. Gerar APK de Debug**
No Android Studio:
1. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. APK gerada em: `android/app/build/outputs/apk/debug/app-debug.apk`

#### **5. Gerar APK de Release (Assinada)**

**a) Criar Keystore:**
```bash
keytool -genkey -v -keystore organiza-te360.keystore -alias organiza-te360 -keyalg RSA -keysize 2048 -validity 10000
```

**b) Configurar `android/app/build.gradle`:**
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file("../../organiza-te360.keystore")
            storePassword "sua-password"
            keyAlias "organiza-te360"
            keyPassword "sua-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

**c) Build Release:**
```bash
cd android
./gradlew assembleRelease
```

APK assinada em: `android/app/build/outputs/apk/release/app-release.apk`

#### **6. Publicar na Google Play Store**
1. Acesse [Google Play Console](https://play.google.com/console)
2. Crie uma nova aplicação
3. Faça upload da APK assinada
4. Preencha informações (descrição, screenshots, etc.)
5. Submeta para revisão

---

## 🍎 Deploy iOS (Opcional)

### **Pré-requisitos**
- macOS
- Xcode instalado
- Apple Developer Account ($99/ano)

### **Passo a Passo:**

```bash
# Adicionar plataforma iOS
npx cap add ios

# Sincronizar
npx cap sync ios

# Abrir Xcode
npx cap open ios
```

No Xcode:
1. Selecione seu Team (Apple Developer Account)
2. Configure Bundle Identifier único
3. **Product → Archive**
4. **Distribute App → App Store Connect**

---

## 🔧 Troubleshooting

### **Erro: "PrismaClient not found"**
**Solução:**
```bash
npx prisma generate
pnpm build
```

### **Erro: "DATABASE_URL is not defined"**
**Solução:** Certifique-se de que a variável está configurada no ambiente de produção.

### **Erro de CORS**
**Solução:** Adicione o domínio de produção no `server/_core/index.ts`:
```typescript
app.use(cors({
  origin: ['https://seu-dominio.com'],
  credentials: true
}));
```

### **Build falha no Vercel**
**Solução:** Verifique se:
- `pnpm-lock.yaml` está commitado
- Todas as dependências estão em `dependencies` (não `devDependencies`)
- Node version está correta (`engines` no `package.json`)

---

## 📊 Monitorização

### **Recomendações:**
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Google Analytics** - Analytics
- **Uptime Robot** - Monitorização de uptime

---

## 🔐 Segurança em Produção

### **Checklist:**
- [ ] Mudar `JWT_SECRET` para valor forte e único
- [ ] Ativar HTTPS (automático no Vercel/Netlify)
- [ ] Configurar rate limiting
- [ ] Adicionar Helmet.js para headers de segurança
- [ ] Validar todas as inputs
- [ ] Sanitizar outputs
- [ ] Fazer backup regular da base de dados
- [ ] Configurar alertas de erro

---

## 📈 Performance em Produção

### **Otimizações:**
- [ ] Ativar compressão gzip/brotli
- [ ] Configurar CDN para assets estáticos
- [ ] Lazy loading de imagens
- [ ] Code splitting
- [ ] Service Worker para cache
- [ ] Database connection pooling (já configurado com Supabase)

---

## 🆘 Suporte

Se encontrar problemas durante o deployment:

1. Verifique os logs da plataforma (Vercel/Netlify)
2. Teste localmente com `pnpm build && pnpm start`
3. Verifique se todas as variáveis de ambiente estão configuradas
4. Consulte a documentação da plataforma

---

**✅ Deployment concluído com sucesso? Parabéns! 🎉**

