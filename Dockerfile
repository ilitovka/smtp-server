FROM node:12.13

WORKDIR /app

COPY . .

RUN npm install --unsafe-perm=true

EXPOSE 8888
EXPOSE 25

CMD ["npm", "start"]
