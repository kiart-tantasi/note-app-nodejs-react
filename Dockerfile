######################## REACT ########################
FROM node:16.15.0-slim AS REACT
WORKDIR /app
COPY frontend/package*.json .
RUN npm install
COPY frontend/. .
RUN npm run build
######################## NODEJS ########################
FROM node:16.15.0-slim AS NODEJS
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/. .
COPY --from=REACT /app/build /app/build
ENTRYPOINT ["node", "app.js"]
######################## NGINX ########################
FROM nginx:alpine
RUN apk update && apk add nodejs
WORKDIR /app
COPY --from=NODEJS /app/. /app/.
COPY nginx.conf /etc/nginx/nginx.conf
COPY certificates/ssl_certificate.pem /etc/ssl/ssl_certificate.pem
COPY certificates/ssl_certificate_key.pem /etc/ssl/ssl_certificate_key.pem
ENTRYPOINT nohup node app.js & nginx -g 'daemon off;'
