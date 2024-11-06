FROM nginx:1.27-alpine

COPY apps/router/15-trusted-origins.envsh /docker-entrypoint.d/
COPY apps/router/sec_headers /etc/nginx/sec_headers
COPY apps/router/nginx.conf /etc/nginx/templates/default.conf.template
COPY apps/router/.well-known /usr/share/nginx/html/.well-known

