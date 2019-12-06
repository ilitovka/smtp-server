FROM node:10.5

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 8888
EXPOSE 25

CMD ["npm", "start"]
