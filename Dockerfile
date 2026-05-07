FROM node:22-alpine AS builder
WORKDIR /app

# Declare build-time placeholder env vars before any COPY/RUN steps so Docker's
# cache chain is correctly invalidated. Real values are injected at runtime via
# docker-compose environment — they are NOT baked into the final runner image.
ARG POCKETBASE_URL=http://placeholder:8090
ARG ORIGIN=http://localhost:3000
ARG DISCORD_BOT_TOKEN=placeholder
ARG DISCORD_GUILD_ID=placeholder
ARG ADMIN_DISCORD_USER_IDS=placeholder
ENV POCKETBASE_URL=$POCKETBASE_URL \
    ORIGIN=$ORIGIN \
    DISCORD_BOT_TOKEN=$DISCORD_BOT_TOKEN \
    DISCORD_GUILD_ID=$DISCORD_GUILD_ID \
    ADMIN_DISCORD_USER_IDS=$ADMIN_DISCORD_USER_IDS

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
ENV NODE_ENV=production

CMD ["node", "build"]
