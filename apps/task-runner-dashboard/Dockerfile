FROM beabee/deno-node:latest as task-runner-dashboard

WORKDIR /opt/apps/task-runner-dashboard

# Copy the workspace configuration
COPY package.json yarn.lock deno.jsonc .yarnrc.yml /opt/
COPY .yarn /opt/.yarn

# Copy @beabee/cli dependencies info
COPY apps/cli/package.json apps/cli/deno.jsonc apps/cli/deno.lock /opt/apps/cli/

# Copy @beabee/task-runner dependencies info
COPY packages/task-runner/package.json packages/task-runner/deno.jsonc packages/task-runner/deno.lock /opt/packages/task-runner/

# Copy task-runner-dashboard dependencies info
COPY apps/task-runner-dashboard/package.json /opt/apps/task-runner-dashboard/package.json

# Copy deno-node dependencies info
COPY docker/deno-node/package.json /opt/docker/deno-node/package.json

# Replace's npm ci
RUN yarn workspaces focus

# Copy the rest of the related packages
COPY apps/cli /opt/apps/cli
COPY packages/task-runner /opt/packages/task-runner

# Copy the rest of task-runner-dashboard
COPY apps/task-runner-dashboard /opt/apps/task-runner-dashboard

# Build the task-runner-dashboard and it's dependencies
RUN NODE_ENV=production yarn build:task-runner-dashboard

CMD ["node", "dist/app.js"]
