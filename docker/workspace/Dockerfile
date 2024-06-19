# This image builds the complete workspace so that other images can copy the result out of it.

ARG VERSION=latest

FROM beabee/deno-node:${VERSION}

ENV NODE_ENV=production

WORKDIR /opt

# Copy the workspace configuration
COPY package.json yarn.lock deno.jsonc .yarnrc.yml /opt/
COPY .yarn /opt/.yarn

# Copy dependencies info..

# .. for docker images
COPY docker/deno-node/package.json /opt/docker/deno-node/
COPY docker/workspace/package.json /opt/docker/workspace/

# .. for packages
COPY packages/common/package.json packages/common/deno.jsonc packages/common/deno.lock /opt/packages/common/
COPY packages/common/src/deps.ts /opt/packages/common/src/deps.ts

COPY packages/task-runner/package.json packages/task-runner/deno.jsonc packages/task-runner/deno.lock /opt/packages/task-runner/
COPY packages/task-runner/src/deps.ts /opt/packages/task-runner/src/deps.ts

COPY packages/locales/package.json packages/locales/deno.jsonc /opt/packages/locales/
COPY packages/config/package.json packages/config/deno.jsonc /opt/packages/config/
COPY packages/core/package.json packages/core/deno.jsonc /opt/packages/core/
COPY packages/models/package.json /opt/packages/models/

# .. for apps
COPY apps/backend/package.json /opt/apps/backend/

COPY apps/cli/package.json apps/cli/deno.jsonc apps/cli/deno.lock /opt/apps/cli/
COPY apps/cli/src/deps.ts /opt/apps/cli/src/deps.ts

COPY apps/frontend/package.json /opt/apps/frontend/

COPY apps/task-runner-dashboard/package.json /opt/apps/task-runner-dashboard/

# Copy the rest 
COPY ./packages /opt/packages
COPY ./apps /opt/apps

# Replace's npm ci
RUN yarn install
# Cache deno dependencies (with 3 retries)
RUN for i in 1 2 3; do yarn deno:cache && break || sleep 5; done

# Build all the packages and apps
RUN NODE_ENV=production yarn build
