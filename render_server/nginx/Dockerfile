FROM nginx:alpine

COPY src /var/www
RUN chmod 755 /var/www/*

EXPOSE 80 443

CMD ["nginx"]