FROM node:24-alpine

RUN npm install -g pnpm@10.24.0

WORKDIR /app

ENV NODE_ENV=production