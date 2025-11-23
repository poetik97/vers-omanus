# 🤝 Guia de Contribuição - Organiza-te360

Obrigado por considerar contribuir para o Organiza-te360! Este documento contém diretrizes para contribuir com o projeto.

---

## 📋 Código de Conduta

Ao participar deste projeto, você concorda em manter um ambiente respeitoso e inclusivo para todos.

### **Comportamentos Esperados:**
- ✅ Usar linguagem acolhedora e inclusiva
- ✅ Respeitar pontos de vista diferentes
- ✅ Aceitar críticas construtivas
- ✅ Focar no que é melhor para a comunidade

### **Comportamentos Inaceitáveis:**
- ❌ Linguagem ou imagens sexualizadas
- ❌ Comentários insultuosos ou depreciativos
- ❌ Assédio público ou privado
- ❌ Publicar informações privadas de outros

---

## 🚀 Como Contribuir

### **1. Reportar Bugs**

Se encontrou um bug, abra uma [issue](https://github.com/seu-usuario/organiza-te360/issues) com:

- **Título claro e descritivo**
- **Passos para reproduzir** o bug
- **Comportamento esperado** vs **comportamento atual**
- **Screenshots** (se aplicável)
- **Ambiente** (browser, OS, versão)

**Template:**
```markdown
## Descrição
Descrição clara do bug

## Passos para Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

## Comportamento Esperado
O que deveria acontecer

## Comportamento Atual
O que está acontecendo

## Screenshots
Se aplicável

## Ambiente
- OS: [ex: Windows 11]
- Browser: [ex: Chrome 120]
- Versão: [ex: 1.0.0]
```

### **2. Sugerir Funcionalidades**

Tem uma ideia? Abra uma [issue](https://github.com/seu-usuario/organiza-te360/issues) com:

- **Descrição clara** da funcionalidade
- **Problema que resolve**
- **Alternativas consideradas**
- **Mockups** (se aplicável)

**Template:**
```markdown
## Funcionalidade
Descrição clara da funcionalidade

## Problema
Que problema esta funcionalidade resolve?

## Solução Proposta
Como funcionaria?

## Alternativas
Outras soluções consideradas

## Mockups
Se aplicável
```

### **3. Contribuir com Código**

#### **Configurar Ambiente de Desenvolvimento**

```bash
# 1. Fork o repositório no GitHub

# 2. Clone o seu fork
git clone https://github.com/seu-usuario/organiza-te360.git
cd organiza-te360

# 3. Adicione o repositório original como upstream
git remote add upstream https://github.com/organizate360/organiza-te360.git

# 4. Instale dependências
pnpm install

# 5. Configure .env
cp .env.example .env
# Preencha as variáveis

# 6. Inicie o servidor de desenvolvimento
pnpm dev
```

#### **Workflow de Desenvolvimento**

```bash
# 1. Crie uma branch para sua feature/fix
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug

# 2. Faça suas mudanças

# 3. Teste localmente
pnpm dev
pnpm build
pnpm test

# 4. Commit suas mudanças
git add .
git commit -m "feat: adiciona nova funcionalidade X"

# 5. Push para o seu fork
git push origin feature/nome-da-feature

# 6. Abra um Pull Request no GitHub
```

#### **Convenções de Commit**

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Mudanças na documentação
- `style:` - Formatação, ponto e vírgula, etc
- `refactor:` - Refatoração de código
- `perf:` - Melhorias de performance
- `test:` - Adicionar ou corrigir testes
- `chore:` - Tarefas de manutenção

**Exemplos:**
```bash
feat: adiciona drag and drop nas tarefas
fix: corrige erro de validação no login
docs: atualiza README com instruções de deploy
style: formata código com prettier
refactor: simplifica lógica de autenticação
perf: otimiza query de transações
test: adiciona testes para componente Button
chore: atualiza dependências
```

#### **Padrões de Código**

- ✅ Use **TypeScript** para type safety
- ✅ Siga o **ESLint** e **Prettier** configurados
- ✅ Escreva **testes** para novas funcionalidades
- ✅ Mantenha **componentes pequenos** e reutilizáveis
- ✅ Use **hooks customizados** para lógica compartilhada
- ✅ Documente **funções complexas** com JSDoc
- ✅ Mantenha **imports organizados**

**Exemplo de Componente:**
```typescript
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MyComponentProps {
  title: string;
  onSubmit: (value: string) => void;
}

/**
 * Componente para fazer X
 * @param title - Título do componente
 * @param onSubmit - Callback ao submeter
 */
export function MyComponent({ title, onSubmit }: MyComponentProps) {
  const [value, setValue] = useState("");

  return (
    <div>
      <h2>{title}</h2>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button onClick={() => onSubmit(value)}>Submeter</Button>
    </div>
  );
}
```

#### **Estrutura de Pastas**

```
client/src/
├── components/      # Componentes reutilizáveis
│   ├── ui/         # Componentes de UI base
│   └── ...
├── pages/          # Páginas da aplicação
├── hooks/          # Custom hooks
├── lib/            # Utilitários e helpers
├── types/          # TypeScript types
└── App.tsx         # Componente principal

server/
├── _core/          # Core do servidor
├── routers/        # tRPC routers
├── auth.ts         # Autenticação
└── db.ts           # Prisma client
```

#### **Testes**

```bash
# Executar testes
pnpm test

# Executar testes em watch mode
pnpm test:watch

# Cobertura de testes
pnpm test:coverage
```

**Exemplo de Teste:**
```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("renderiza o título corretamente", () => {
    render(<MyComponent title="Teste" onSubmit={() => {}} />);
    expect(screen.getByText("Teste")).toBeInTheDocument();
  });

  it("chama onSubmit ao clicar no botão", () => {
    const handleSubmit = vi.fn();
    render(<MyComponent title="Teste" onSubmit={handleSubmit} />);
    
    const button = screen.getByText("Submeter");
    button.click();
    
    expect(handleSubmit).toHaveBeenCalled();
  });
});
```

---

## 📝 Pull Request Process

### **Checklist antes de submeter:**

- [ ] Código segue os padrões do projeto
- [ ] Testes passam (`pnpm test`)
- [ ] Build funciona (`pnpm build`)
- [ ] Documentação atualizada (se necessário)
- [ ] Commits seguem Conventional Commits
- [ ] Branch está atualizada com `main`

### **Template de Pull Request:**

```markdown
## Descrição
Descrição clara das mudanças

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## Como Testar
Passos para testar as mudanças

## Screenshots
Se aplicável

## Checklist
- [ ] Código segue os padrões
- [ ] Testes passam
- [ ] Build funciona
- [ ] Documentação atualizada
```

### **Processo de Revisão:**

1. Mantenedor revisa o PR
2. Feedback é dado (se necessário)
3. Você faz as mudanças solicitadas
4. PR é aprovado e merged

---

## 🎨 Contribuir com Design

### **Diretrizes de Design:**

- Use o **Design System** existente
- Mantenha **consistência** visual
- Priorize **acessibilidade** (WCAG 2.1 AA)
- Teste em **múltiplos dispositivos**

### **Cores:**
- Primary: `#a855f7` (Purple 500)
- Secondary: `#f97316` (Orange 500)
- Accent: `#ec4899` (Pink 500)

### **Tipografia:**
- Font: Inter
- Heading: 700 (Bold)
- Body: 400 (Regular)

---

## 📚 Contribuir com Documentação

Documentação é tão importante quanto código!

- Corrija **typos**
- Melhore **clareza**
- Adicione **exemplos**
- Traduza para **outros idiomas**

---

## 🏆 Reconhecimento

Todos os contribuidores serão reconhecidos no README.md!

---

## 💬 Dúvidas?

- Abra uma [issue](https://github.com/seu-usuario/organiza-te360/issues)
- Entre no nosso [Discord](https://discord.gg/organizate360)
- Envie email para: contato@organiza-te360.com

---

**Obrigado por contribuir! 🙏**

