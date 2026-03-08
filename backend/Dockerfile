FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# O Cloud Run exige que o app ouça na porta da variável de ambiente $PORT
CMD ["node", "server.js"]