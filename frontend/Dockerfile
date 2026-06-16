FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.5.1 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
ENV CI=true
RUN pnpm install --frozen-lockfile --config.confirmModulesPurge=false || pnpm install --frozen-lockfile --ignore-scripts

FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node_modules/.bin/next", "dev", "--hostname", "0.0.0.0"]
