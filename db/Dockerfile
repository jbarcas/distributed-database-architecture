FROM node:8

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY yarn.lock ./

RUN yarn install
# If you are building your code for production
# RUN npm install --only=production

RUN git clone https://github.com/facebook/rocksdb.git && \
    cd rocksdb && \
    git checkout tags/v5.18.3 && \
    make static_lib

# Bundle app source
COPY . .

EXPOSE 8081
CMD [ "yarn", "start" ]
