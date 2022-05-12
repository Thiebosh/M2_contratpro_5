# step 1 - build the final image
FROM nginx:1.17.8-alpine as server

WORKDIR /var/www

CMD ["nginx", "-g", "daemon off;"]

COPY nginx/nginx.conf /etc/nginx/conf.d

## add permissions for nginx user
RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chmod 003 /var/www

EXPOSE 8080


# step2 - pull official base image and build app
FROM node:16.13.2-alpine as builder

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY public ./public
COPY src ./src
COPY tsconfig.json .
RUN npm run build


# step3 - copy the result files
FROM server

COPY --from=builder /app/build .

RUN chmod -R 644 $(find . -type f) && chmod -R 755 $(find . -type d)

USER nginx
