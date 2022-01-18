FROM nginx:alpine

# COPY nginx.conf /etc/nginx/nginx.conf
# COPY sites /etc/nginx/sites-available
# COPY conf.d /etc/nginx/conf.d

COPY src /var/www

RUN chmod 755 /var/www/*

EXPOSE 80 443

CMD ["nginx"]