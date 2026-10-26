# syntax=docker/dockerfile:1

FROM node:24-alpine AS build
RUN npm install --global pnpm@11.22.0
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:24-alpine AS runtime
RUN npm install --global pnpm@11.22.0
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

# drizzle-kit precisa do schema e das migrations para atualizar o banco na subida.
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.output ./.output
COPY --from=build --chown=node:node /app/src ./src
COPY --from=build --chown=node:node /app/drizzle ./drizzle
COPY --from=build --chown=node:node /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=build --chown=node:node /app/package.json ./package.json

USER node
EXPOSE 3000
CMD ["sh", "-c", "./node_modules/.bin/drizzle-kit migrate && exec node .output/server/index.mjs"]
