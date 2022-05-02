# syntax=docker/dockerfile:1
FROM node:17.9.0-slim

run mkdir ./project
WORKDIR ./project

ENV NODE_ENV=production

COPY package*.json ./
# RUN alias npm="node --dns-result-order=ipv4first $(which npm)" && npm install
RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++ \
    && npm install \
    && apk del .gyp

EXPOSE 1234

COPY . .

CMD ["npm", "run", "start"]