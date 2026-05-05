FROM node:22-alpine AS builder
WORKDIR /app

# Declare build-time placeholder env vars before any COPY/RUN steps so Docker's
# cache chain is correctly invalidated. Real values are injected at runtime via
# docker-compose environment — they are NOT baked into the final runner image.
ARG DATABASE_URL=postgres://placeholder:placeholder@placeholder:5432/placeholder
ARG BETTER_AUTH_SECRET=build-time-placeholder
ARG ORIGIN=http://localhost:3000
ARG DISCORD_CLIENT_ID=placeholder
ARG DISCORD_CLIENT_SECRET=placeholder
ENV DATABASE_URL=$DATABASE_URL \
    BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET \
    ORIGIN=$ORIGIN \
    DISCORD_CLIENT_ID=$DISCORD_CLIENT_ID \
    DISCORD_CLIENT_SECRET=$DISCORD_CLIENT_SECRET

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
