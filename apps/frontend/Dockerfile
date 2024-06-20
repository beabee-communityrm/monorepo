ARG VERSION=latest
FROM beabee/workspace:${VERSION} as workspace-builder

#### -> FRONTEND ####

FROM nginx:1.24-alpine

WORKDIR /opt/apps/frontend

ARG REVISION

ENV APP_REVISION=${REVISION}
ENV APP_VERSION=${VERSION}

COPY apps/frontend/docker-entrypoint.sh /docker-entrypoint.d/30-beabee-frontend.sh
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=workspace-builder --chown=nginx:nginx /opt/apps/frontend/dist/ /usr/share/nginx/html

#### <- FRONTEND ####
