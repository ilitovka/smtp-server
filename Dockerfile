FROM node:18.12.1-alpine3.17

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY . .

# unsafe-perm is reasonable because app requires root access to listen 25 tcp port
RUN npm i --unsafe-perm=true

EXPOSE 8888
EXPOSE 25

CMD ["npm", "start"]
