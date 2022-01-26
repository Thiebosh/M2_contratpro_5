FROM php:7

ARG arg_port

RUN echo "php -S 0.0.0.0:${arg_port} /app/index.php" > docker_entrypoint.sh &&\
    chmod 755 docker_entrypoint.sh

EXPOSE $arg_port

CMD ["./docker_entrypoint.sh"]
