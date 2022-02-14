FROM python:3.9-slim-buster

RUN pip install -U --no-cache-dir \
        pip \
        pymongo[srv]==4.0.1 \
        google-api-python-client>=2.0.2 \
        google-auth-httplib2>=0.1.0 \
        google-auth-oauthlib>=0.4.3
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

WORKDIR /src

CMD cd brique2/cpp && \
    make build && \
    python ../../
