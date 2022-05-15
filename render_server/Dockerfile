FROM php:7

ARG arg_port

EXPOSE $arg_port

CMD ["php", "-S", "0.0.0.0:5000", "/app/index.php"]

COPY src /app
