FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN mkdir -p uploads logs && chown -R node:node /app

USER node

EXPOSE 5000

CMD ["npm", "start"]