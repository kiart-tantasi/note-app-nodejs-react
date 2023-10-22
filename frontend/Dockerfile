#############################################
FROM node:16.15.0-slim AS build

WORKDIR /app

COPY package*.json .

# TODO: change to `yarn install --prefer-offline --frozen-lockfile`
RUN npm install

COPY . .

RUN npm run build

#############################################
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY --from=build /app/build .

# set up nginx and certificate
COPY nginx.conf /etc/nginx/nginx.conf
COPY certificates/certificate.pem /etc/ssl/ssl_certificate.pem
COPY certificates/private_key.pem /etc/ssl/ssl_certificate_key.pem

ENTRYPOINT ["nginx", "-g", "daemon off;"]

# ref: https://typeofnan.dev/how-to-serve-a-react-app-with-nginx-in-docker/
