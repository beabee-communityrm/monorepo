ARG VERSION=latest
FROM beabee/workspace:${VERSION} as workspace-builder

#### -> ROUTER ####

FROM nginx:1.24-alpine as router

COPY apps/backend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx --from=workspace-builder /opt/apps/backend/dist/static /opt/apps/backend/dist/static

#### <- ROUTER ####

#### -> APP ####

FROM node:20-alpine3.20 as app

ARG REVISION=DEV

ENV NODE_ENV=production
ENV NODE_OPTIONS=--enable-source-maps
WORKDIR /opt/apps/backend

# Copy the workspace configuration
COPY --chown=node:node --from=workspace-builder /opt/package.json /opt/
COPY --chown=node:node --from=workspace-builder /opt/yarn.lock /opt/
COPY --chown=node:node --from=workspace-builder /opt/.yarnrc.yml /opt/
COPY --chown=node:node --from=workspace-builder /opt/.yarn /opt/.yarn
COPY --chown=node:node --from=workspace-builder /opt/node_modules /opt/node_modules

# Apps and packages
COPY --chown=node:node --from=workspace-builder /opt/apps/backend /opt/apps/backend
COPY --chown=node:node --from=workspace-builder /opt/packages /opt/packages
COPY --chown=node:node --from=workspace-builder /opt/docker /opt/docker

# Debian
# COPY apps/backend/crontab /etc/cron.d/beabee-cron
# RUN chmod 0644 /etc/cron.d/beabee-cron

COPY apps/backend/crontab /etc/crontabs/root

RUN echo -n ${REVISION} > /opt/apps/backend/dist/revision.txt

# Replace's npm prune
RUN yarn workspaces focus @beabee/backend --production

USER node

CMD [ "yarn", "start:app:prod" ]

#### <- APP ####
