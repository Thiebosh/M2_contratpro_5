FROM python:3.9-slim-buster

RUN pip install -U --no-cache-dir \
        pip \
        quart==0.16.1 \
        flask_api==3.0.post1 \
        pymongo[srv]==4.0.1 \
        simple_bcrypt==0.1.0
# run adduser --disabled-password runner &&\
#     chown -R runner .

EXPOSE 5000
# USER runner

WORKDIR /src
COPY src .

CMD ["python", "."]
