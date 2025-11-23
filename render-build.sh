#!/usr/bin/env bash
# Script de build para Render

set -o errexit

echo "📦 Instalando dependências..."
pnpm install

echo "🔧 Gerando Prisma Client..."
pnpm exec prisma generate

echo "🏗️ Fazendo build da aplicação..."
pnpm build

echo "✅ Build concluído com sucesso!"
