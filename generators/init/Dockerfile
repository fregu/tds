FROM node:10.16.3-alpine

## Install OS dependencies
RUN apk --no-cache add \
    ca-certificates \
    build-base \
    autoconf \
    automake \
    zlib \
    bash \
    libltdl \
    libtool \
    zlib-dev \
    nasm
ENV ACLOCAL_PATH=/usr/share/aclocal
ENV LIBRARY_PATH=/lib:/usr/lib

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
