FROM node:carbon-alpine

# Create app directory
WORKDIR /usr/src/app

# Expose environment variables
ENV NODE_ENV dev
ENV PORT 3000
ENV SERVICE_URL http://localhost:9001
ENV JWT_SECRET f83e3aa8a9c796fc55f33154eb86b824514b223ad4a2749350ffeb697efe4de6

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Bundle app source
COPY client ./client/
COPY server ./server/
COPY shared ./shared/
COPY webpack.config.js ./
COPY .babelrc ./

EXPOSE $PORT
EXPOSE 9001

CMD [ "npm", "start" ]