######################## REACT ########################
FROM node:16.15.0-slim AS REACT
WORKDIR /app
COPY frontend/package*.json .
RUN npm install
COPY frontend/. .
RUN npm run build
######################## NODEJS ########################
FROM node:16.15.0-slim
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/. .
COPY --from=REACT /app/build /app/build
ENTRYPOINT ["node", "app.js"]
