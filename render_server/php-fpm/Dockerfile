FROM php:fpm-alpine

RUN apk add nginx

RUN apk add supervisor
COPY ./supervisord.conf /etc/

RUN mkdir -p /run/nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d /etc/nginx/conf.d
COPY sites /etc/nginx/sites-available

COPY src /var/www
RUN chmod 755 /var/www/*

EXPOSE 80 443 9000

CMD ["sh", "-c", "php-fpm -D ; sleep 2 && nginx"]
# CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
