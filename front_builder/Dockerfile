FROM node:16-alpine

ARG arg_port

EXPOSE $arg_port

CMD ["npm", "run", "dev"]

COPY . ./
RUN npm install
