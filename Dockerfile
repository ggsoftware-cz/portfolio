FROM node:22-alpine
RUN corepack enable && corepack prepare pnpm@11.7.0 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

RUN cp -r public .next/standalone/ \
    && cp -r .next/static .next/standalone/.next/

ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000
EXPOSE 3000

WORKDIR /app/.next/standalone
CMD ["node", "server.js"]
