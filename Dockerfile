FROM nginx:1.18.0-alpine

COPY nginx.conf /etc/nginx/templates/default.conf.template

