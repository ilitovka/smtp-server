FROM node:18.12.1-alpine3.16

WORKDIR /app

COPY . .

# unsafe-perm is reasonable because app requires root access to listen 25 tcp port
RUN npm i --unsafe-perm=true

EXPOSE 8888
EXPOSE 25

CMD ["npm", "start"]
