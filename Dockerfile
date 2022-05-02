# syntax=docker/dockerfile:1
FROM node:alpine

run mkdir ./project
WORKDIR ./project

ENV NODE_ENV=production

COPY package*.json ./
# RUN alias npm="node --dns-result-order=ipv4first $(which npm)" && npm install
RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++ \
    && npm install \
    && apk del build-dependencies

EXPOSE 1234

COPY . .

CMD ["npm", "run", "start"]