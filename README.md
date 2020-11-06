## Activity RSVP Service ##

### Installation

To install all dependencies please execute following command:

    npm install

### Configuration
Create configuration file based on config.json.dist with name config.json and place it to the root folder of Service.

### Run Redis service with Docker
First of all you need to install Docker (https://docs.docker.com/install/). After you have installed docker open terminal
and run container with command:
    docker run --name <container name> -p <outer port:inner port> -d redis
For example:
```
docker run --name redis-server -p 16379:6379 -d redis
```

Usefull commands:
  To list all containers running on your machine:
  ```
  docker container ls --all
  ```
  To start container:
  ```
  docker container start redis-server
  ```
  To stop running container:
  ```
  docker container stop redis-server
  ```

### Service start
```
sudo npm start
```
Sudo needed to run own SMTP server on 25 port. 

### Running tests
To execute tests you need to run:
```
npm test
```
### Useful cli commands
To execute sending status flow you need to run (replace values to you own):
```
node cli/test-send-attendee-status.js --orgId 00DS0000003Eixf --decision Yes --type run
```
