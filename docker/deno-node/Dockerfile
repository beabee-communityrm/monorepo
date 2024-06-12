# Inspiration https://github.com/halvardssm/docker-custom-images/blob/main/deno-node/Dockerfile

ARG DENO_VERSION=v1.44.1
ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-bookworm

# Set shell
SHELL ["/bin/bash", "-c"]

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
