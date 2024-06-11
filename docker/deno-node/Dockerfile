# Inspiration https://github.com/halvardssm/docker-custom-images/blob/main/deno-node/Dockerfile

ARG DENO_VERSION=v1.44.1
ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-bookworm

# Set shell
SHELL ["/bin/bash", "-c"]

USER node

# Install Deno
RUN curl -fsSL https://deno.land/install.sh | sh -s ${DENO_VERSION}
ENV HOME="/home/node"
ENV DENO_INSTALL="${HOME}/.deno"
ENV PATH="${DENO_INSTALL}/bin:${PATH}"
RUN echo "${PATH}"

RUN node --version
RUN npm --version
RUN yarn --version
RUN deno --version

USER root
