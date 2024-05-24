FROM node:20.10-alpine as builder

RUN apk add --no-cache make g++ git gcc libgcc libstdc++ linux-headers python3
RUN npm install -g node-gyp 

WORKDIR /opt/apps/backend

# Copy the workspace configuration
COPY package.json yarn.lock .yarnrc.yml /opt/
COPY .yarn /opt/.yarn

COPY apps/backend/package.json /opt/apps/backend/package.json
COPY packages/common/package.json /opt/packages/common/package.json

# Replace's npm ci
RUN yarn workspaces focus

# Copy the related packages
# TODO: Copy only the necessary files
COPY apps/backend /opt/apps/backend
COPY packages/common /opt/packages/common

# COPY apps/backend/gulpfile.js apps/backend/tsconfig.json apps/backend/tsconfig.build.json /opt/
# COPY apps/backend/src /opt/src/
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

COPY --chown=node:node --from=builder /opt/node_modules /opt/node_modules
COPY --chown=node:node --from=builder /opt/apps/backend/package.json /opt/apps/backend/
COPY --chown=node:node --from=builder /opt/packages/common/package.json /opt/packages/common/
COPY --chown=node:node --from=builder /opt/apps/backend/node_modules /opt/apps/backend/node_modules
COPY --chown=node:node --from=builder /opt/packages/common/node_modules /opt/packages/common/node_modules

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
