FROM python:3.9-slim-buster

RUN pip install -U --no-cache-dir \
        pip \
        pymongo[srv]==4.0.1
# RUN adduser --disabled-password runner &&\
#     chown -R runner /src

EXPOSE 5001
# USER runner

WORKDIR /src
COPY src .

CMD ["python", "."]
