FROM node:12.13

WORKDIR /app

COPY . .

# unsafe-perm is reasonable because app requires root access to listen 25
RUN npm install --unsafe-perm=true

EXPOSE 8888
EXPOSE 25

CMD ["npm", "start"]
