FROM node:20-slim AS deps
WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile

FROM node:20-slim AS builder
WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN corepack enable && corepack prepare pnpm@latest --activate && pnpm build

FROM node:20-slim AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/next.config.ts ./next.config.ts
COPY --from=builder /usr/src/app/next-env.d.ts ./next-env.d.ts
COPY --from=builder /usr/src/app/tsconfig.json ./tsconfig.json
COPY --from=builder /usr/src/app/postcss.config.mjs ./postcss.config.mjs
COPY --from=builder /usr/src/app/eslint.config.mjs ./eslint.config.mjs
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/app ./app
COPY --from=builder /usr/src/app/components ./components
COPY --from=builder /usr/src/app/lib ./lib
COPY --from=builder /usr/src/app/types ./types

EXPOSE 3000
CMD ["pnpm", "start"]
