FROM php:7

ARG arg_port

RUN echo "php -S 0.0.0.0:${arg_port} /app/index.php" > /home/docker_entrypoint.sh &&\
    chmod 755 /home/docker_entrypoint.sh

EXPOSE $arg_port

CMD ["./home/docker_entrypoint.sh"]
