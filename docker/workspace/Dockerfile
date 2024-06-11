FROM beabee/deno-node:latest

WORKDIR /opt

# Copy the workspace configuration
COPY package.json yarn.lock deno.jsonc .yarnrc.yml /opt/
COPY .yarn /opt/.yarn

# Copy dependencies info
COPY packages/common/package.json packages/common/deno.jsonc packages/common/deno.lock /opt/packages/common/
COPY packages/locales/package.json packages/locales/deno.jsonc /opt/packages/locales/
COPY packages/task-runner/package.json packages/task-runner/deno.jsonc packages/task-runner/deno.lock /opt/packages/task-runner/

COPY apps/backend/package.json /opt/apps/backend/
COPY apps/cli/package.json apps/cli/deno.jsonc apps/cli/deno.lock /opt/apps/cli/
COPY apps/frontend/package.json /opt/apps/frontend/
COPY apps/task-runner-dashboard/package.json /opt/apps/task-runner-dashboard/

# Copy the rest 
COPY ./packages /opt/packages
COPY ./apps /opt/apps

# Replace's npm ci
RUN yarn install

# RUN yarn deno:cache

# Build all the packages and apps
RUN NODE_ENV=production yarn build
