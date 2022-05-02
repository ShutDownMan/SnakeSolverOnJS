# syntax=docker/dockerfile:1
FROM node:alpine

run mkdir ./project
WORKDIR ./project

ENV NODE_ENV=production

COPY package*.json ./
# RUN alias npm="node --dns-result-order=ipv4first $(which npm)" && npm install
RUN apk add --no-cache --virtual .gyp python3 make g++ \
    && npm install --production \
    && apk del .gyp

EXPOSE 1234

COPY . .

CMD ["npm", "run", "start"]