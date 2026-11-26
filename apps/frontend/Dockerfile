ARG NODE_VERSION=26.13.0

FROM node:${NODE_VERSION}-bookworm-slim AS builder

# Check versions
RUN node --version
RUN npm --version
RUN npm install -g yarn@1.22.22 && yarn --version

WORKDIR /opt

# Copy the workspace configuration
COPY package.json yarn.lock .yarnrc.yml /opt/
COPY .yarn /opt/.yarn

# Copy dependencies info, only the workspaces the frontends depend on
COPY packages/common/package.json /opt/packages/common/package.json
COPY packages/client/package.json /opt/packages/client/package.json
COPY packages/locale/package.json /opt/packages/locale/package.json
COPY apps/frontend/package.json /opt/apps/frontend/package.json
COPY apps/frontend-old/package.json /opt/apps/frontend-old/package.json

# Copy dependencies with relevant content
COPY packages/prettier-config /opt/packages/prettier-config
COPY packages/tsconfig /opt/packages/tsconfig
COPY packages/vue /opt/packages/vue
COPY packages/fontawesome /opt/packages/fontawesome

# Copy apps with relevant content
COPY apps/dev-cli /opt/apps/dev-cli

# Install dependencies, the Yarn cache is a cache mount so it stays out of the image
RUN --mount=type=cache,target=/root/.yarn/berry/cache yarn workspaces focus @beabee/frontend @beabee/frontend-old

# Copy frontend dependencies
COPY packages/common /opt/packages/common
COPY packages/client /opt/packages/client
COPY packages/locale /opt/packages/locale

# Copy and build both frontends and their shared dependencies
COPY apps/frontend /opt/apps/frontend
COPY apps/frontend-old /opt/apps/frontend-old
RUN yarn workspaces foreach --recursive --topological-dev \
  --from @beabee/frontend --from @beabee/frontend-old run build

FROM nginx:1.31-alpine

ARG REVISION
ARG VERSION

ENV APP_REVISION=${REVISION}
ENV APP_VERSION=${VERSION}
ENV DEFAULT_FRONTEND=old

COPY apps/frontend/docker-entrypoint.sh /docker-entrypoint.d/30-beabee-frontend.sh
COPY apps/frontend/nginx.conf /etc/nginx/templates/default.conf.template

# Both builds ship side by side, nginx.conf picks one per request
COPY --from=builder --chown=nginx:nginx /opt/apps/frontend-old/dist/ /usr/share/nginx/html/old
COPY --from=builder --chown=nginx:nginx /opt/apps/frontend/dist/ /usr/share/nginx/html/new
