FROM php:fpm-alpine

RUN apk add nginx supervisor

COPY nginx/nginx.conf /etc/nginx/
COPY nginx/conf.d/ /etc/nginx/conf.d/
COPY nginx/sites/ /etc/nginx/sites-available/

COPY ./supervisord.conf /etc/

COPY src/ /var/www/
RUN chmod 755 /var/www/*

EXPOSE 80 443

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
