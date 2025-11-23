# Multi-stage build para otimizar tamanho da imagem
FROM node:22-alpine AS builder

# Instalar dependências de build
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Instalar pnpm globalmente
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar package files
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Build da aplicação
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_APP_TITLE
ARG VITE_ANALYTICS_ENDPOINT
ARG VITE_ANALYTICS_WEBSITE_ID

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_APP_TITLE=$VITE_APP_TITLE
ENV VITE_ANALYTICS_ENDPOINT=$VITE_ANALYTICS_ENDPOINT
ENV VITE_ANALYTICS_WEBSITE_ID=$VITE_ANALYTICS_WEBSITE_ID

RUN pnpm build

# Estágio de produção
FROM node:22-alpine

WORKDIR /app

# Instalar pnpm globalmente usando corepack (método oficial)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar package files
COPY package.json pnpm-lock.yaml ./

# Instalar apenas dependências de produção
RUN pnpm install --prod --frozen-lockfile

# Copiar build e prisma do estágio anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Gerar Prisma Client no estágio de produção
RUN npx prisma@6.19.0 generate

# Expor porta (Cloud Run usa PORT env var)
ENV PORT=3000
EXPOSE 3000

# Comando de start usando node diretamente
# Nota: Cloud Run faz health checks externamente, não é necessário HEALTHCHECK no Dockerfile
CMD ["node", "dist/index.js"]

