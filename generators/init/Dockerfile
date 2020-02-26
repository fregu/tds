FROM node:10

ENV NODE_ENV production
ENV HOST_NAME 0.0.0.0
ENV PORT 8080
ENV SESSION_KEY thisismylittlesecret

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

RUN npm run build --production

CMD npm run serve
