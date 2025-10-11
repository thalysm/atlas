# Etapa 1 - Builder: Instala dependências e faz o build
FROM node:20-alpine AS builder

# 1. Declare os argumentos que serão recebidos do docker-compose.yml
ARG NEXT_PUBLIC_API_URL

WORKDIR /app

COPY package*.json ./

# É mais seguro usar 'npm ci' para builds consistentes
RUN npm install --legacy-peer-deps

COPY . .

# 2. Torne os ARGs disponíveis como ENVs para o comando de build
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN rm -rf .next

# O build agora reconhecerá as variáveis NEXT_PUBLIC_
RUN npm run build

# Etapa 2 - Runner: Imagem leve para produção
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copia os artefatos de build da etapa anterior
COPY --from=builder /app/.next .next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/tsconfig.json ./

EXPOSE 3000

CMD ["npm", "run", "start"]