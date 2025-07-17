##### BASE STAGE #####
FROM node:lts-alpine AS base
# Set working directory
WORKDIR /app
# Install corepack
RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -
  # Enable pnpm
  ENV PNPM_HOME="/pnpm"
  ENV PATH="$PNPM_HOME:$PATH"
  RUN corepack enable
  RUN corepack install -g pnpm@latest
  RUN corepack prepare pnpm@latest --activate

###### DEPENDENCIES STAGE #####
FROM base AS deps
# Install dependencies
COPY package.json ./
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --prefer-offline

###### BUILD STAGE #####
FROM deps AS build
# Copy source files
COPY . .
# Build the application
RUN pnpm run build

##### FINAL STAGE #####
FROM base AS final
# Set important environment variables
ENV NODE_ENV=production
#ENV ORIGIN=https://
# Copy built files from the build stage
COPY --from=build /app/dist /app/dist
COPY --from=build /app/server /app/server
# Copy package.json for production dependencies
COPY package.json ./
# Install production dependencies
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --prod --prefer-offline

# install nginx
RUN apk add --no-cache nginx

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose web port
EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]