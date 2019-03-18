# Use the Node.JS
FROM node:10-alpine

WORKDIR /monibot

COPY . /monibot

RUN npm install

EXPOSE 9100

CMD ["node", "/monibot/main.js"]