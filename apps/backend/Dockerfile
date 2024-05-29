FROM node:20.10-alpine as builder

# Add support for Node.js c/c++ addons and Deno
RUN apk add --no-cache make g++ git gcc libgcc libstdc++ linux-headers python3 deno
RUN npm install -g node-gyp 
RUN deno --version

WORKDIR /opt/apps/backend

# Copy the workspace configuration
COPY package.json yarn.lock .yarnrc.yml /opt/
COPY .yarn /opt/.yarn

# Copy common dependencies info
COPY packages/common/package.json /opt/packages/common/package.json
COPY packages/common/deno.json /opt/packages/common/deno.json
COPY packages/common/deno.lock /opt/packages/common/deno.lock

# Copy backend dependencies info
COPY apps/backend/package.json /opt/apps/backend/package.json

# Replace's npm ci
RUN yarn workspaces focus

# Copy the rest of the related packages
COPY packages/common/src /opt/packages/common/src
COPY packages/common/cli /opt/packages/common/cli
COPY packages/common/test /opt/packages/common/test
COPY packages/common/mod.ts packages/common/tsconfig.json /opt/packages/common/
COPY apps/backend /opt/apps/backend

# Build the backend and it's dependencies
RUN NODE_ENV=production yarn build:common
RUN NODE_ENV=production yarn build:backend

FROM nginx:1.24-alpine as router

COPY apps/backend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx --from=builder /opt/apps/backend/built/static /opt/apps/backend/built/static

FROM node:20.10-alpine as app

ARG REVISION=DEV

ENV NODE_ENV=production

WORKDIR /opt/apps/backend

# Workspace settings
COPY --chown=node:node --from=builder /opt/package.json /opt/yarn.lock /opt/.yarnrc.yml /opt/
COPY --chown=node:node --from=builder /opt/.yarn /opt/.yarn

# Copy the node_module's and package.json's
COPY --chown=node:node --from=builder /opt/node_modules /opt/node_modules
COPY --chown=node:node --from=builder /opt/apps/backend/package.json /opt/apps/backend/
COPY --chown=node:node --from=builder /opt/packages/common/package.json /opt/packages/common/

# Replace's npm prune
RUN yarn workspaces focus --production

COPY --chown=node:node --from=builder /opt/apps/backend/built /opt/apps/backend/built
COPY --chown=node:node --from=builder /opt/packages/common/dist /opt/packages/common/dist

COPY apps/backend/crontab /etc/crontabs/root

RUN echo -n ${REVISION} > /opt/apps/backend/built/revision.txt

ENV NODE_ENV=production
ENV NODE_OPTIONS=--enable-source-maps

USER node
CMD [ "node", "./built/app.js" ]
