FROM node:16-alpine

ARG arg_port

COPY . ./
RUN npm install

EXPOSE $arg_port

CMD ["npm", "run", "dev"]
