# step 1 - build the final image
FROM python:3.9-alpine as server

WORKDIR /app

ARG arg_port
EXPOSE $arg_port

CMD ["python", "-m", "http.server", "5000"]


# step2 - pull official base image and build app
FROM node:16.13.2-alpine as builder

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY public ./public
COPY src ./src
COPY tsconfig.json .
RUN npm run build


# step3 - copy the result files
FROM server

COPY --from=builder /app/build .
