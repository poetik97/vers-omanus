#!/bin/bash

# Script para limpar arquivos sensíveis do histórico do Git
# ATENÇÃO: Este script reescreve o histórico do Git!

echo "🔒 Limpando arquivos sensíveis do histórico do Git..."
echo ""
echo "⚠️  ATENÇÃO: Este processo vai reescrever o histórico do Git!"
echo "⚠️  Certifique-se de ter um backup antes de continuar."
echo ""
read -p "Deseja continuar? (s/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]
then
    echo "❌ Operação cancelada."
    exit 1
fi

echo ""
echo "📋 Arquivos que serão removidos do histórico:"
echo "  - .env"
echo "  - .env.backup"
echo "  - supabase_credentials.txt"
echo ""

# Remover .env do histórico
echo "🧹 Removendo .env..."
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Remover .env.backup do histórico
echo "🧹 Removendo .env.backup..."
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.backup" \
  --prune-empty --tag-name-filter cat -- --all

# Remover supabase_credentials.txt do histórico
echo "🧹 Removendo supabase_credentials.txt..."
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch supabase_credentials.txt" \
  --prune-empty --tag-name-filter cat -- --all

# Limpar referências antigas
echo "🗑️  Limpando referências antigas..."
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "✅ Histórico limpo com sucesso!"
echo ""
echo "📊 Verificando arquivos sensíveis restantes..."
if git log --all --full-history --pretty=format:"%H" -- .env .env.backup supabase_credentials.txt | grep -q .; then
    echo "⚠️  AVISO: Ainda existem referências a arquivos sensíveis no histórico!"
else
    echo "✅ Nenhum arquivo sensível encontrado no histórico."
fi

echo ""
echo "🎯 Próximos passos:"
echo "1. Verifique se está tudo correto: git log --oneline"
echo "2. Crie o repositório no GitHub"
echo "3. Adicione o remote: git remote add origin https://github.com/SEU-USUARIO/organiza-te360.git"
echo "4. Faça o push: git push -u origin main --force"
echo ""
echo "⚠️  IMPORTANTE: Use --force no primeiro push pois o histórico foi reescrito!"
