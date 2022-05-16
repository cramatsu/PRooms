FROM node:16-alpine AS build

WORKDIR /usr/prooms
COPY package.json yarn.lock tsconfig.json ./
RUN yarn install
COPY src ./src
RUN yarn run build

WORKDIR /usr/prooms
FROM node:16-alpine
COPY package.json yarn.lock ./
COPY --from=build /usr/prooms/dist ./dist
RUN yarn install
CMD ["yarn","run","start"]