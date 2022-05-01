# syntax=docker/dockerfile:1
FROM node:17.9.0-slim

RUN mkdir /app
WORKDIR /app

ENV NODE_ENV=production

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production

EXPOSE 1234

COPY . .

CMD ["npm", "run", "start"]
