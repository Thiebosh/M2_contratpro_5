FROM python:3.9-slim-buster

RUN pip install -U --no-cache-dir \
        pip \
        pymongo[srv]==4.0.1
RUN apt update &&\
    apt install -y \
        g++ \
        make \
        flex \
        bison

ARG arg_port

EXPOSE $arg_port

ENV HOST=0.0.0.0
ENV PORT=$arg_port

WORKDIR /src

CMD cd brique2/cpp && \
    make build && \
    python ../../
