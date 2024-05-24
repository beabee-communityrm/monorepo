FROM node:20.10-alpine as builder

RUN apk add --no-cache make g++ git gcc libgcc libstdc++ linux-headers python3
RUN npm install -g node-gyp 

WORKDIR /opt/membership-system/apps/backend

# Copy the workspace configuration
COPY package.json yarn.lock .yarnrc.yml /opt/membership-system/
COPY .yarn /opt/membership-system/.yarn

# Copy the related packages
# TODO: Copy only the necessary files
COPY apps/backend /opt/membership-system/apps/backend
COPY packages/common /opt/membership-system/packages/common

# Replace's npm ci
RUN yarn install

# COPY apps/backend/gulpfile.js apps/backend/tsconfig.json apps/backend/tsconfig.build.json /opt/membership-system/
# COPY apps/backend/src /opt/membership-system/src/
RUN NODE_ENV=production yarn build:backend

FROM nginx:1.24-alpine as router

COPY apps/backend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx --from=builder /opt/membership-system/apps/backend/built/static /opt/membership-system/apps/backend/built/static

FROM node:20.10-alpine as app

ARG REVISION=DEV

ENV NODE_ENV=production

WORKDIR /opt/membership-system/apps/backend

COPY --chown=node:node --from=builder /opt/membership-system/package.json /opt/membership-system/yarn.lock /opt/membership-system/.yarnrc.yml /opt/membership-system/
COPY --chown=node:node --from=builder /opt/membership-system/.yarn /opt/membership-system/.yarn
COPY --chown=node:node --from=builder /opt/membership-system/node_modules /opt/membership-system/node_modules
COPY --chown=node:node --from=builder /opt/membership-system/apps /opt/membership-system/apps
COPY --chown=node:node --from=builder /opt/membership-system/packages /opt/membership-system/packages

# Replace's npm prune
# RUN yarn install --force

COPY --chown=node:node --from=builder /opt/membership-system/apps/backend/built /opt/membership-system/apps/backend/built

COPY apps/backend/crontab /etc/crontabs/root

RUN echo -n ${REVISION} > /opt/membership-system/apps/backend/built/revision.txt

ENV NODE_ENV=production
ENV NODE_OPTIONS=--enable-source-maps

USER node
CMD [ "yarn", "start:backend" ]
