FROM python:3.9-slim-buster

ARG arg_port

EXPOSE $arg_port

ENV HOST=0.0.0.0
ENV PORT=$arg_port

WORKDIR /src

CMD ["python", "."]

COPY requirements.txt .
RUN pip install -U -r requirements.txt
