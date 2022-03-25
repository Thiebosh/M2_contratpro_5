FROM python:3.9-slim-buster

RUN apt update &&\
    apt install -y \
        g++ \
        make \
        flex \
        bison

ARG arg_port
ARG php_url

EXPOSE $arg_port

ENV HOST=0.0.0.0
ENV PORT=$arg_port
ENV PHP_URL=$php_url
ENV CPP_PATH="/src/brique2/cpp/prototypeur.exe"
ENV DRIVE_PATH="/credentials/service_account.json"

WORKDIR /src

CMD cd brique2/cpp && \
    make build && \
    python ../../

COPY requirements.txt .
RUN pip install -U -r requirements.txt
