FROM python:3.9-slim-buster

RUN pip install -U --no-cache-dir \
        pip \
        pymongo[srv]==4.0.1

EXPOSE 5001

WORKDIR /src
COPY src .

RUN adduser --disabled-password runner && chown -R runner .
USER runner

CMD ["python", "."]
