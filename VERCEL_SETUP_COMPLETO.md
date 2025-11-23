# 🚀 Guia Completo de Deploy no Vercel - Organiza-te360

Este guia irá ajudá-lo a fazer o deploy completo do **Organiza-te360** no Vercel para começar a vender o seu produto.

---

## 📋 Pré-requisitos

1. ✅ Conta no Vercel (https://vercel.com)
2. ✅ Conta no GitHub (já tem - repositório: `poetik97/organiza-te360`)
3. ✅ Conta no Supabase (já configurada)
4. ✅ Chave da OpenAI (já configurada)

---

## 🔧 Passo 1: Importar Projeto no Vercel

### 1.1. Aceder ao Vercel

1. Vá para https://vercel.com
2. Faça login com a sua conta GitHub
3. Clique em **"Add New Project"**

### 1.2. Importar do GitHub

1. Selecione o repositório: **`poetik97/organiza-te360`**
2. Clique em **"Import"**

### 1.3. Configurar Build Settings

**Framework Preset:** Vite  
**Root Directory:** `./` (deixar vazio)  
**Build Command:** `pnpm vercel-build`  
**Output Directory:** `dist/public`  
**Install Command:** `pnpm install`

---

## 🔑 Passo 2: Configurar Variáveis de Ambiente

No Vercel, vá para **Settings → Environment Variables** e adicione:

### **Database (Supabase)**

```
DATABASE_URL=postgresql://postgres.vwhdihrnifhndvnzglry:portimaoparchal@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```

```
DIRECT_URL=postgresql://postgres.vwhdihrnifhndvnzglry:portimaoparchal@aws-1-eu-north-1.pooler.supabase.com:5432/postgres
```

### **Supabase Frontend**

```
VITE_SUPABASE_URL=https://vwhdihrnifhndvnzglry.supabase.co
```

```
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aGRpaHJuaWZobmR2bnpnbHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MzA2NTksImV4cCI6MjA0NjIwNjY1OX0.evJqc3M1Q1JzdXBhYmFzZS5jbw
```

```
SUPABASE_URL=https://vwhdihrnifhndvnzglry.supabase.co
```

```
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3aGRpaHJuaWZobmR2bnpnbHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2MzAxMjIsImV4cCI6MjA0NjIwNjEyMn0.evJgc3MiOzJzdXBhYmFzZSI
```

### **OpenAI (IA)**

```
OPENAI_API_URL=https://api.openai.com/v1
```

```
OPENAI_API_KEY=sk-aSRAkJ5R5WAEivpWAg6NT
```

### **App Configuration**

```
VITE_APP_ID=proj_organiza_te360
```

```
VITE_APP_TITLE=Organiza-te360
```

```
VITE_APP_LOGO=https://placehold.co/40x40/a855f7/ffffff?text=O
```

```
VITE_OAUTH_PORTAL_URL=https://vida.butterfly-effect.dev
```

```
OAUTH_SERVER_URL=https://vidabiz.butterfly-effect.dev
```

```
JWT_SECRET=prod-jwt-secret-change-this-to-random-string-123456789
```

```
PORT=3000
```

```
NODE_ENV=production
```

**⚠️ IMPORTANTE:** Adicione TODAS as variáveis acima! Sem elas, a aplicação não funcionará.

---

## 🚀 Passo 3: Deploy

1. Depois de configurar todas as variáveis, clique em **"Deploy"**
2. O Vercel irá:
   - Instalar dependências (`pnpm install`)
   - Gerar Prisma Client (`prisma generate`)
   - Build do frontend (`vite build`)
   - Build do backend (`node build.mjs`)
3. Aguarde 2-5 minutos

---

## ✅ Passo 4: Verificar Deployment

### 4.1. Verificar Build

- Vá para **Deployments** no Vercel
- Verifique se o status está **"Ready"** ✅
- Se houver erro, verifique os logs

### 4.2. Testar a Aplicação

1. Clique no link do deployment (ex: `https://organiza-te360.vercel.app`)
2. A aplicação deve carregar corretamente
3. Teste:
   - ✅ Login funciona
   - ✅ Dashboard carrega
   - ✅ Criar tarefa funciona
   - ✅ Todas as páginas funcionam

---

## 🔄 Passo 5: Configurar Domínio Personalizado (Opcional)

### 5.1. Adicionar Domínio

1. Vá para **Settings → Domains**
2. Clique em **"Add Domain"**
3. Digite o seu domínio (ex: `organiza-te360.com`)
4. Siga as instruções para configurar DNS

### 5.2. Configurar DNS

No seu provedor de domínio (ex: GoDaddy, Namecheap):

**Tipo A:**
```
@ → 76.76.21.21
```

**Tipo CNAME:**
```
www → cname.vercel-dns.com
```

---

## 🐛 Troubleshooting

### Problema: "Build failed"

**Solução:**
1. Verifique se todas as variáveis de ambiente estão configuradas
2. Verifique os logs de build no Vercel
3. Certifique-se de que `pnpm` está sendo usado

### Problema: "Database connection failed"

**Solução:**
1. Verifique `DATABASE_URL` e `DIRECT_URL`
2. Teste a conexão no Supabase
3. Certifique-se de que a password está correta: `portimaoparchal`

### Problema: "OpenAI API error"

**Solução:**
1. Verifique se `OPENAI_API_KEY` está configurada
2. Verifique se a chave é válida
3. As funcionalidades básicas funcionam sem IA

### Problema: "Page shows source code"

**Solução:**
1. Verifique se o build command é: `pnpm vercel-build`
2. Verifique se o output directory é: `dist/public`
3. Force redeploy: **Deployments → ... → Redeploy**

---

## 📊 Monitorização

### Analytics

O Vercel fornece analytics automáticos:
- **Visitors:** Número de visitantes
- **Page Views:** Visualizações de página
- **Performance:** Tempo de carregamento

Aceda em: **Analytics** no dashboard do Vercel

### Logs

Para ver logs em tempo real:
1. Vá para **Deployments**
2. Clique no deployment ativo
3. Clique em **"Runtime Logs"**

---

## 💰 Custos Vercel

### **Plano Hobby (Grátis)**
- ✅ 100 GB bandwidth/mês
- ✅ Deployments ilimitados
- ✅ SSL automático
- ✅ Domínio personalizado
- ❌ Sem analytics avançados
- ❌ Sem suporte prioritário

### **Plano Pro ($20/mês)**
- ✅ 1 TB bandwidth/mês
- ✅ Analytics avançados
- ✅ Suporte prioritário
- ✅ Proteção DDoS
- ✅ Logs avançados

**Recomendação:** Comece com o plano Hobby. Upgrade quando tiver mais de 1000 utilizadores/mês.

---

## 🔐 Segurança

### Variáveis Sensíveis

✅ **Nunca** partilhe:
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `JWT_SECRET`
- `SUPABASE_ANON_KEY`

### SSL/HTTPS

✅ O Vercel fornece SSL automático para todos os domínios

### CORS

✅ Já configurado no backend para aceitar requests do frontend

---

## 📱 Próximos Passos

Depois do deploy bem-sucedido:

1. ✅ **Testar todas as funcionalidades** em produção
2. ✅ **Configurar domínio personalizado** (opcional)
3. ✅ **Criar contas de teste** para demonstrações
4. ✅ **Preparar materiais de marketing**
5. ✅ **Definir preços e planos**
6. ✅ **Começar a vender!** 🚀

---

## 📞 Suporte

Se encontrar problemas:

1. **Logs do Vercel:** Verifique os logs de build e runtime
2. **Supabase Dashboard:** Verifique a conexão da base de dados
3. **GitHub Issues:** Crie um issue no repositório
4. **Vercel Support:** https://vercel.com/support

---

## ✨ Checklist Final

Antes de começar a vender, certifique-se de que:

- [ ] ✅ Deploy no Vercel está **"Ready"**
- [ ] ✅ Todas as variáveis de ambiente configuradas
- [ ] ✅ Aplicação carrega sem erros
- [ ] ✅ Login funciona
- [ ] ✅ Todas as 9 funcionalidades testadas
- [ ] ✅ Base de dados conectada
- [ ] ✅ IA funciona (Diário, Ciclo Menstrual, Chat)
- [ ] ✅ Domínio configurado (opcional)
- [ ] ✅ SSL ativo (HTTPS)
- [ ] ✅ Performance aceitável (<3s load time)

---

## 🎉 Parabéns!

O seu **Organiza-te360** está agora em produção e pronto para vender!

**URL de Produção:** https://organiza-te360.vercel.app

**Próximo passo:** Comece a promover e vender o seu produto! 💰

---

**Última atualização:** Novembro 2025  
**Versão:** 1.0.0
