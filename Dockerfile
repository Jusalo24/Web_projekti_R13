FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./src ./src
COPY ./public ./public
RUN npm run build

EXPOSE 3000

CMD [ "serve", "-s", "build" ]
