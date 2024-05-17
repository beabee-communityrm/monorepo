FROM node:20.10-alpine as builder

WORKDIR /opt/beabee-frontend

COPY package.json package-lock.json ./
RUN npm ci

COPY . ./
RUN NODE_ENV=production npx vite build && npx vite build -c vite.config.public.ts

FROM nginx:1.24-alpine

ARG REVISION

ENV APP_REVISION=${REVISION}
ENV APP_VERSION=${VERSION}

COPY docker-entrypoint.sh /docker-entrypoint.d/30-beabee-frontend.sh
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=nginx:nginx /opt/beabee-frontend/dist/ /usr/share/nginx/html
