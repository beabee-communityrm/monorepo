FROM nginx:1.24-alpine

COPY sec_headers /etc/nginx/sec_headers

COPY nginx.conf /etc/nginx/templates/default.conf.template

