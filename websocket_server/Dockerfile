# first stage : prepare server environment
FROM python:3.9-slim-buster as server

RUN apt update &&\
    apt install -y \
        g++

ARG arg_port
ARG php_url

#content the path reference for our file
ARG valueID=627e3ed4e9f9d2f53e8b1d37

ENV HOST=0.0.0.0
ENV PORT=$arg_port
ENV PHP_URL=$php_url
ENV CPP_PATH="/src/brique2/cpp/"
ENV DRIVE_PATH="/credentials/service_account.json"


EXPOSE $arg_port

CMD ["python", "."]

COPY requirements.txt .
RUN pip install -U -r requirements.txt

WORKDIR /credentials
COPY credentials .

WORKDIR /src
COPY src .
COPY cpp/templates ./templates

# second stage : build cpp exe
FROM python:3.9-slim-buster as builder

RUN apt update &&\
    apt install -y \
        g++ \
        make \
        flex \
        bison

WORKDIR /src
COPY cpp .

RUN make build valueID="627e3ed4e9f9d2f53e8b1d37"


# third stage : copy all files
FROM server

COPY --from=builder /src/627e3ed4e9f9d2f53e8b1d37.exe /src/brique2/cpp/
