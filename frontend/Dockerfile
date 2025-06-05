# Base image
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# === Install dependencies (cached if package.json unchanged)
FROM base AS deps
COPY package*.json ./
RUN npm ci

# === Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
EXPOSE 3000

# Copy only the built assets from the frontend (already built)
COPY ./.next ./.next
COPY ./public ./public
COPY ./package.json ./package.json

# Use non-root user if needed (optional)
# RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs
# USER nextjs

RUN npm i --omit=dev
CMD ["npm", "start"]
