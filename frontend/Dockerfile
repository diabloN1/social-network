FROM node:20-alpine

WORKDIR /app

COPY . .

RUN ls -la

RUN npm install -g npm@latest
RUN npm ci

RUN npm run build

EXPOSE 3000

RUN find .next/static/css -type f -exec ls -l {} \;

CMD ["npm", "run", "start"]
