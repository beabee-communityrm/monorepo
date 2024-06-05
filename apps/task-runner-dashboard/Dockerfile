FROM node:20-alpine3.19 as task-runner-dashboard

# Add support for Deno
RUN apk add --no-cache deno
RUN deno --version

WORKDIR /opt/apps/task-runner-dashboard

# Copy the workspace configuration
COPY package.json yarn.lock deno.jsonc .yarnrc.yml /opt/
COPY .yarn /opt/.yarn

# Copy cli dependencies info
COPY apps/cli/package.json /opt/apps/cli/package.json
COPY apps/cli/deno.jsonc /opt/apps/cli/deno.jsonc
COPY apps/cli/deno.lock /opt/apps/cli/deno.lock

# Copy task-runner-dashboard dependencies info
COPY apps/task-runner-dashboard/package.json /opt/apps/task-runner-dashboard/package.json

# Replace's npm ci
RUN yarn workspaces focus

# Copy the rest of the related packages
COPY apps/cli /opt/apps/cli

# Copy the rest of task-runner-dashboard
COPY apps/task-runner-dashboard /opt/apps/task-runner-dashboard

# Build the task-runner-dashboard and it's dependencies
RUN NODE_ENV=production yarn build:task-runner-dashboard

CMD ["node", "dist/app.js"]
