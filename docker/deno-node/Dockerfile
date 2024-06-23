# Inspiration https://github.com/halvardssm/docker-custom-images/blob/main/deno-node/Dockerfile

ARG DENO_VERSION=v1.44.4
ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-bookworm

RUN apt-get update && apt-get install -y cron

USER node

# Install Deno
RUN curl -fsSL https://deno.land/install.sh | sh -s ${DENO_VERSION}
ENV DENO_INSTALL="/home/node/.deno"
ENV DENO_DIR="/home/node/.deno"
ENV PATH="${DENO_INSTALL}/bin:${PATH}"

RUN node --version
RUN npm --version
RUN yarn --version
RUN deno --version

RUN node -e "console.log('Welcome to Node!')"
RUN deno eval "console.log('Welcome to Deno!')"

USER root
RUN mkdir -p /opt
RUN chown -R node:node /opt
