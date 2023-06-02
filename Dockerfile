FROM node:14.15.0-alpine3.12

WORKDIR /app

COPY . .

RUN npm install

CMD ["npm", "run", "dev"]