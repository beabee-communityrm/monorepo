FROM nginx:1.23.3-alpine

COPY nginx.conf /etc/nginx/templates/default.conf.template

