# syntax = docker/dockerfile:1

FROM node:22-alpine

LABEL andasy_launch_runtime="Node.js"

WORKDIR /app
ENV NODE_ENV="production"

RUN apk add --no-cache \
    build-base \
    python3 \
    pkgconfig \
    libusb-dev \
    eudev-dev \
    hidapi-dev

COPY package-lock.json package.json ./
RUN npm ci --include=dev

COPY . .
RUN npm run build
RUN npm prune --omit=dev

ENV HOST=::
ENV PORT=4000

EXPOSE 4000
CMD ["sh", "-c", "node dist/scripts/create-tables.js && node dist/scripts/seed-all.js && node dist/server.js"]