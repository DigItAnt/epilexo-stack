FROM node:10.24.1
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
RUN  node ./node_modules/xslt3/xslt3.js -t -xsl:./stylesheets/start-edition.xsl -export:./stylesheets/start-edition.sef.json -nogo -ns:##html5
CMD [ "node", "server.js"]