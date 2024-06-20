ARG VERSION=latest
FROM beabee/workspace:${VERSION} as workspace-builder

#### -> APP ####

FROM node:20-alpine3.20 as app

ARG REVISION=DEV

ENV NODE_ENV=production
ENV NODE_OPTIONS=--enable-source-maps
WORKDIR /opt/apps/task-runner-worker

# Copy the workspace configuration
COPY --chown=node:node --from=workspace-builder /opt/package.json /opt/
COPY --chown=node:node --from=workspace-builder /opt/yarn.lock /opt/
COPY --chown=node:node --from=workspace-builder /opt/.yarnrc.yml /opt/
COPY --chown=node:node --from=workspace-builder /opt/.yarn /opt/.yarn
COPY --chown=node:node --from=workspace-builder /opt/node_modules /opt/node_modules

# Copy dependency info
# Note: We don't need the source files because the app is bundled, but yarn needs the package.json files
COPY --chown=node:node --from=workspace-builder /opt/packages/common/package.json /opt/packages/common/
COPY --chown=node:node --from=workspace-builder /opt/packages/config/package.json /opt/packages/config/
COPY --chown=node:node --from=workspace-builder /opt/packages/core/package.json /opt/packages/core/
COPY --chown=node:node --from=workspace-builder /opt/packages/locales/package.json /opt/packages/locales/
COPY --chown=node:node --from=workspace-builder /opt/packages/models/package.json /opt/packages/models/
COPY --chown=node:node --from=workspace-builder /opt/packages/task-runner/package.json /opt/packages/task-runner/

COPY --chown=node:node --from=workspace-builder /opt/docker/deno-node/package.json /opt/docker/deno-node/
COPY --chown=node:node --from=workspace-builder /opt/docker/workspace/package.json /opt/docker/workspace/

# Copy the app itself
COPY --chown=node:node --from=workspace-builder /opt/apps/task-runner-worker /opt/apps/task-runner-worker

# Replace's npm prune
RUN yarn workspaces focus @beabee/task-runner-worker --production

USER node

CMD [ "yarn", "start:task-runner-worker" ]

#### <- APP ####
