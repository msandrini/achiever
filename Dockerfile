FROM node:carbon-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

# Bundle app source
COPY client ./client/
COPY server ./server/
COPY shared ./shared/
COPY webpack.common.js ./
COPY webpack.prod.js ./
COPY .babelrc ./
COPY achiever.config.js ./

EXPOSE $PORT
EXPOSE 9001

RUN npm run build
RUN npm install pm2 -g

# Expose environment variables
ENV NODE_ENV production
ENV PORT 3000
ENV SERVICE_URL http://localhost:9001
ENV JWT_SECRET f83e3aa8a9c796fc55f33154eb86b824514b223ad4a2749350ffeb697efe4de6

RUN npm prune
RUN npm install --only=production
RUN rm -fr ./client/components
RUN rm -fr ./client/styles
RUN rm -fr ./client/public
RUN rm -f ./client/*.json
RUN rm -f ./client/*.js
RUN rm -f ./client/*.jsx
RUN rm -f ./client/*.graphql
RUN npm cache clean --force

CMD [ "pm2-runtime", "achiever.config.js" ]