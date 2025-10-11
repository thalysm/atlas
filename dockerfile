# Etapa 1 - Builder
FROM node:20-alpine AS builder
ARG NEXT_PUBLIC_API_URL
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN rm -rf .next
RUN npm run build

# Etapa 2 - Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Variáveis de ambiente de runtime
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY --from=builder /app/.next .next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/tsconfig.json ./

EXPOSE 3000

CMD ["npm", "run", "start"]
