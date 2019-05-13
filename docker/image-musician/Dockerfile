FROM node:8

EXPOSE 2205

ADD src /opt/src/

WORKDIR /opt/src/

RUN npm init -y

RUN npm install --save moment

RUN npm install --save uuid

ENTRYPOINT [ "node", "index.js" ]
