# pull official base image
FROM node:slim

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
# add app
COPY . .
# COPY package-lock.json . # on a pas ce fichier ??

RUN npm install
RUN npm install react-scripts@3.4.1 -g

# start app
CMD ["npm", "start"]
