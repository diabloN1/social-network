# Base image
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Install dependencies (cached)
FROM base AS deps
COPY package*.json ./
RUN npm install -g npm@latest
RUN npm ci --omit=dev

# Build stage
FROM deps AS builder
COPY . .
RUN npm run build   # Runs next build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
EXPOSE 3000

# Copy only the production build and dependencies from previous stages
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

CMD ["npm", "start"]
