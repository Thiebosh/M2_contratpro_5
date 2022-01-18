FROM php:fpm-alpine

COPY src /var/www
RUN chmod 755 /var/www/*

EXPOSE 9000

CMD ["php-fpm"]