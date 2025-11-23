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

