FROM node:18-alpine3.14

ENV NODE_OPTIONS=--max_old_space_size=4096

RUN mkdir -p /app

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD ["node", "dist/index.js"]
USER node