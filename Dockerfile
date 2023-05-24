FROM nginx:1.24-alpine

COPY nginx.conf /etc/nginx/templates/default.conf.template

