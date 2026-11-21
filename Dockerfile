##### BASE STAGE #####
FROM node:lts-alpine AS base
WORKDIR /app
# Same pnpm as package.json "packageManager" (node:lts no longer ships corepack)
RUN npm install -g pnpm@12.11.2

###### DEPENDENCIES STAGE #####
FROM base AS deps
# The lockfile and pnpm-workspace.yaml (allowBuilds: sharp) are needed for a reproducible install.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile --prefer-offline

###### BUILD STAGE #####
FROM deps AS build
COPY . .
# Qwik v2: client build to dist/, node-server SSR build to server/
RUN pnpm run build

##### FINAL STAGE #####
FROM base AS final
ENV NODE_ENV=production
# Runtime env: API_URL (oceano-core base URL). Set ORIGIN (e.g. https://admin.oceanorentals.net) once the
# node server's origin check is turned back on (src/entry.node-server.tsx).
COPY --from=build /app/dist /app/dist
COPY --from=build /app/server /app/server
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --prod --frozen-lockfile --prefer-offline

# nginx in front of the Qwik server (port 3000), proxies /backbone/api and /socket.io to oceano-core
RUN apk add --no-cache nginx
COPY nginx.conf /etc/nginx/nginx.conf

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
