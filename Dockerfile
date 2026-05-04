FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY admin/package.json admin/package.json
COPY backend/package.json backend/package.json

RUN npm ci

COPY scripts ./scripts
COPY frontend ./frontend
COPY admin ./admin
COPY backend ./backend

RUN npm run build && npm prune --omit=dev

FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/frontend/package.json ./frontend/package.json
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/admin/package.json ./admin/package.json
COPY --from=builder /app/admin/dist ./admin/dist
COPY --from=builder /app/backend ./backend

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:'+(process.env.PORT||'3000')+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["bun", "backend/src/index.ts"]