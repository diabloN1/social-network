# Base image
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# === Install dependencies (cached if package.json unchanged)
FROM base AS deps
COPY package*.json ./
RUN npm ci

# === Build app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# === Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
EXPOSE 3000

# Copy only what's needed for production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Use non-root user if needed (optional)
# RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs
# USER nextjs

CMD ["npm", "start"]