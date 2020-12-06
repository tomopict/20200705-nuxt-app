FROM node:12.6.0

ENV PORT 3000
ENV HOST 0.0.0.0
ENV APP_ROOT /app
ENV TZ 'Asia/Tokyo'

COPY package*.json ./
WORKDIR ${APP_ROOT}

RUN npm install --no-bin-links -g yarn && \
    yarn install --production

COPY . .

EXPOSE 3000

RUN npm rebuild node-sass &&\
    yarn build

CMD [ "yarn", "start" ]