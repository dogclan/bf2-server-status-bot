FROM node:24.12.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

ADD . /usr/src/app

RUN npm run build

CMD ["node", "dist/bin/bot.js"]
