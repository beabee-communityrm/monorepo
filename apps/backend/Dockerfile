# Nginx Stage
FROM nginx:1.24-alpine as router
COPY apps/backend/nginx.conf /etc/nginx/nginx.conf
COPY apps/backend/built/static /usr/share/nginx/html

# Node Stage
FROM node:20.10-alpine as app
WORKDIR /opt/membership-system

# Copy the Yarn settings from the root folder
COPY yarn.lock .yarnrc.yml /opt/membership-system/
COPY .yarn /opt/membership-system/.yarn/

# Copy the package.json
COPY apps/backend/package.json /opt/membership-system/

# Install the production dependencies only for the backend
RUN yarn workspaces focus --production

# Copy stuff needed for the legacy frontend and Gulp
# TODO: Remove this
COPY apps/backend/gulpfile.js apps/backend/tsconfig.json apps/backend/tsconfig.build.json /opt/membership-system/
COPY apps/backend/src /opt/membership-system/src/

# Copy the built files
COPY apps/backend/built /opt/membership-system/built

# Copy the crontab
COPY apps/backend/crontab /etc/crontabs/root

# Write the revision to the file
RUN echo -n ${REVISION} > /opt/membership-system/built/revision.txt

# Set the environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS=--enable-source-maps

# Switch to the node user
USER node

CMD [ "node", "built/app" ]
