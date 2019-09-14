FROM node:alpine

LABEL maintainer="lhzbxx@gmail.com"

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . ./

CMD ["yarn", "serve"]
