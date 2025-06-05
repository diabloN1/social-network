# Base image
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# === Install dependencies (cached if package.json unchanged)
FROM base AS deps
COPY package*.json ./
RUN npm install -g npm@latest
RUN npm ci --omit=dev

# === Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
EXPOSE 3000

# Copy only the built assets from the frontend (already built)
COPY ./.next ./.next
COPY ./public ./public
COPY ./package.json ./package.json
COPY ./node_modules ./node_modules

CMD ["npm", "start"]
