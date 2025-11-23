# 🛠️ Guia de Resolução de Problemas - Windows

Este guia ajuda a resolver erros comuns ao instalar o **Organiza-te360** no Windows.

---

## ❌ Erro: "ERESOLVE unable to resolve dependency tree"

### 📋 Descrição do Problema

Ao executar `npm install`, você vê este erro:

```
npm error ERESOLVE unable to resolve dependency tree
npm error Could not resolve dependency:
npm error peer vite@"^4.0.0 || ^5.0.0" from @builder.io/vite-plugin-jsx-loc@0.1.1
```

**Causa:** Conflito de versões entre dependências do Vite.

---

## ✅ Soluções (tente na ordem)

### **Solução 1: Usar pnpm** (⭐ Recomendado)

O projeto foi desenvolvido com **pnpm**, que resolve melhor as dependências.

#### Passo 1: Instalar pnpm

```powershell
npm install -g pnpm
```

#### Passo 2: Limpar cache (opcional)

```powershell
pnpm store prune
```

#### Passo 3: Instalar dependências

```powershell
pnpm install
```

#### Passo 4: Executar o projeto

```powershell
pnpm dev
```

**✅ Esta é a solução mais confiável!**

---

### **Solução 2: npm com --legacy-peer-deps**

Se não quiser instalar pnpm, use esta flag:

```powershell
npm install --legacy-peer-deps
```

Esta flag ignora conflitos de peer dependencies.

Depois execute:

```powershell
npm run dev
```

---

### **Solução 3: npm com --force**

Se a Solução 2 não funcionar:

```powershell
npm install --force
```

⚠️ **Atenção:** Esta opção força a instalação, mas pode causar problemas.

Depois execute:

```powershell
npm run dev
```

---

### **Solução 4: Limpar cache e tentar novamente**

Se nenhuma das soluções acima funcionar:

#### Passo 1: Limpar cache do npm

```powershell
npm cache clean --force
```

#### Passo 2: Deletar node_modules e package-lock.json

```powershell
# No PowerShell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Ou no Command Prompt
rmdir /s /q node_modules
del package-lock.json
```

#### Passo 3: Instalar novamente

```powershell
npm install --legacy-peer-deps
```

---

### **Solução 5: Atualizar Node.js**

Certifique-se de que tem a versão mais recente do Node.js:

#### Verificar versão atual

```powershell
node --version
```

Deve ser **v18.0.0** ou superior.

#### Atualizar Node.js

1. Baixe a versão LTS mais recente: https://nodejs.org/
2. Instale e reinicie o terminal
3. Verifique: `node --version`
4. Tente instalar novamente: `npm install --legacy-peer-deps`

---

## 🔍 Outros Problemas Comuns

### Problema: "Port 3000 already in use"

**Solução:**

```powershell
# Encontrar processo na porta 3000
netstat -ano | findstr :3000

# Matar processo (substitua PID pelo número encontrado)
taskkill /PID <PID> /F
```

Ou altere a porta em `server/index.ts`:

```typescript
const PORT = process.env.PORT || 3001; // Mudou de 3000 para 3001
```

---

### Problema: "Cannot find module 'xyz'"

**Solução:**

```powershell
# Deletar node_modules
Remove-Item -Recurse -Force node_modules

# Instalar novamente
pnpm install
# ou
npm install --legacy-peer-deps
```

---

### Problema: "Permission denied" ou "EACCES"

**Solução:**

Execute o PowerShell como **Administrador**:

1. Clique com botão direito no ícone do PowerShell
2. Selecione "Executar como Administrador"
3. Tente instalar novamente

---

### Problema: Página em branco no browser

**Solução:**

1. Verifique se o backend está rodando: `http://localhost:3000`
2. Limpe o cache do browser (Ctrl+Shift+Delete)
3. Feche e abra o browser novamente
4. Execute `pnpm dev` novamente

---

### Problema: "Database connection failed"

**Solução:**

1. Verifique se o arquivo `.env` existe na raiz do projeto
2. Verifique se `DATABASE_URL` está configurado corretamente
3. Teste a conexão:

```powershell
pnpm prisma:studio
```

Se abrir uma interface web, a conexão está OK!

---

### Problema: "OpenAI API error"

**Solução:**

1. Verifique se `OPENAI_API_KEY` está no arquivo `.env`
2. Se não tiver chave da OpenAI, as funcionalidades básicas ainda funcionam
3. Para obter uma chave: https://platform.openai.com/api-keys

---

### Problema: Scripts do PowerShell desabilitados

**Erro:**

```
cannot be loaded because running scripts is disabled on this system
```

**Solução:**

Execute como Administrador:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Depois tente novamente.

---

## 📝 Comandos Úteis

### Verificar versões

```powershell
node --version        # Deve ser v18+
npm --version         # Deve ser v9+
pnpm --version        # Se instalado
```

### Limpar tudo e recomeçar

```powershell
# Limpar cache
npm cache clean --force

# Deletar node_modules
Remove-Item -Recurse -Force node_modules

# Deletar lock files
Remove-Item -Force package-lock.json
Remove-Item -Force pnpm-lock.yaml

# Instalar novamente
pnpm install
# ou
npm install --legacy-peer-deps
```

### Verificar se o servidor está rodando

```powershell
# Testar backend
curl http://localhost:3000

# Testar frontend
curl http://localhost:5173
```

---

## 🎯 Checklist de Troubleshooting

Quando algo não funciona, verifique:

- [ ] Node.js v18+ instalado
- [ ] Terminal executado como Administrador (se necessário)
- [ ] Arquivo `.env` existe na raiz do projeto
- [ ] `node_modules` foi instalado com sucesso
- [ ] Nenhum erro no terminal ao executar `pnpm dev`
- [ ] Backend rodando em `http://localhost:3000`
- [ ] Frontend rodando em `http://localhost:5173`
- [ ] Firewall não está bloqueando as portas
- [ ] Antivírus não está bloqueando o Node.js

---

## 💡 Dicas para Windows

### 1. Use PowerShell em vez de Command Prompt

PowerShell tem melhor suporte para comandos modernos.

### 2. Execute como Administrador quando necessário

Alguns comandos precisam de privilégios elevados.

### 3. Use pnpm sempre que possível

É mais rápido e confiável que npm no Windows.

### 4. Mantenha Node.js atualizado

Baixe sempre a versão LTS mais recente.

### 5. Desabilite antivírus temporariamente

Se tiver problemas de instalação, o antivírus pode estar bloqueando.

---

## 🆘 Ainda com problemas?

Se nenhuma solução funcionou:

### 1. Verifique os logs completos

```powershell
npm install --legacy-peer-deps > install-log.txt 2>&1
```

Abra `install-log.txt` e procure por erros específicos.

### 2. Tente em outro terminal

- Git Bash
- WSL (Windows Subsystem for Linux)
- Command Prompt

### 3. Verifique requisitos do sistema

- Windows 10/11
- 4GB RAM mínimo
- 1GB espaço em disco
- Conexão à internet estável

---

## ✅ Instalação Bem-Sucedida

Quando tudo funcionar, você verá:

```
✓ Built in XXXms

  VITE v5.4.11  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

E o backend:

```
🚀 Server running on http://localhost:3000
📊 tRPC endpoints available at /trpc
```

**Agora é só abrir o browser em http://localhost:5173 e usar o app! 🎉**

---

## 📚 Recursos Adicionais

- **Node.js Download:** https://nodejs.org/
- **pnpm Docs:** https://pnpm.io/
- **Vite Docs:** https://vitejs.dev/
- **Troubleshooting npm:** https://docs.npmjs.com/troubleshooting

---

**Desenvolvido com ❤️**  
**Última atualização:** Novembro 2025
