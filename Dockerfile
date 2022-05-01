# syntax=docker/dockerfile:1
FROM node:17.1.0-slim

run mkdir ./project
WORKDIR ./project

ENV NODE_ENV=production

COPY package*.json ./
RUN alias npm="node --dns-result-order=ipv4first $(which npm)" && npm install

EXPOSE 1234

COPY . .

CMD ["npm", "run", "run"]