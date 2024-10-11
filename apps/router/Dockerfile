FROM nginx:1.24-alpine

COPY 15-trusted-origins.envsh /docker-entrypoint.d/
COPY sec_headers /etc/nginx/sec_headers
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY .well-known /usr/share/nginx/html/.well-known

