# Inspiration https://github.com/halvardssm/docker-custom-images/blob/main/deno-node/Dockerfile

# TODO try to use alpine:
# https://github.com/nodejs/docker-node/blob/main/20/alpine3.20/Dockerfile
# https://github.com/denoland/deno_docker/blob/main/alpine.dockerfile
# The problem is that node and deno install different system libraries that seem to be incompatible with each other.

ARG DENO_VERSION=v1.44.2
ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-bookworm

# Set shell
# SHELL ["/bin/bash", "-c"]

RUN apt-get update && apt-get install -y cron

# Install Deno
RUN curl -fsSL https://deno.land/install.sh | sh -s ${DENO_VERSION}
ENV DENO_INSTALL="/root/.deno"
ENV DENO_DIR="/root/.deno"
ENV PATH="${DENO_INSTALL}/bin:${PATH}"
RUN echo "${PATH}"

RUN node --version
RUN npm --version
RUN yarn --version
RUN deno --version

RUN node -e "console.log('Welcome to Node!')"
RUN deno eval "console.log('Welcome to Deno!')"
