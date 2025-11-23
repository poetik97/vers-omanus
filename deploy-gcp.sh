#!/bin/bash

# Script de Deployment Rápido para Google Cloud Run
# Organiza-te360

set -e

echo "🚀 Deployment do Organiza-te360 no Google Cloud Run"
echo "=================================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI não encontrado!${NC}"
    echo "Instala o Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Obter PROJECT_ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠️  Nenhum projeto configurado.${NC}"
    echo "Configura o projeto com:"
    echo "  gcloud config set project [PROJECT_ID]"
    exit 1
fi

echo -e "${GREEN}✅ Projeto:${NC} $PROJECT_ID"
echo ""

# Confirmar deployment
read -p "Fazer deployment no projeto '$PROJECT_ID'? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelado."
    exit 1
fi

echo ""
echo "📦 Passo 1/3: Build da imagem Docker..."
echo "========================================"
gcloud builds submit --tag gcr.io/$PROJECT_ID/organiza-te360

echo ""
echo "🚀 Passo 2/3: Deploy no Cloud Run..."
echo "===================================="
gcloud run deploy organiza-te360 \
  --image gcr.io/$PROJECT_ID/organiza-te360 \
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

echo ""
echo "🔍 Passo 3/3: Obter URL do serviço..."
echo "====================================="
SERVICE_URL=$(gcloud run services describe organiza-te360 --platform managed --region europe-west1 --format 'value(status.url)')

echo ""
echo -e "${GREEN}🎉 Deployment completo!${NC}"
echo "=================================================="
echo ""
echo -e "${GREEN}✅ URL da aplicação:${NC} $SERVICE_URL"
echo ""
echo "📋 Próximos passos:"
echo "  1. Acede ao URL acima para testar"
echo "  2. Atualiza o Site URL no Supabase:"
echo "     https://supabase.com/dashboard/project/vwhdihrnifhndvnzglry/auth/url-configuration"
echo "  3. Define Site URL como: $SERVICE_URL"
echo "  4. Adiciona Redirect URL: $SERVICE_URL/**"
echo ""
echo -e "${GREEN}✨ Tudo pronto!${NC}"
