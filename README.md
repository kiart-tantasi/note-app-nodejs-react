# Demo

<img src="/demos/demo-1.png" alt="App demo" height="800px" />

# Environment Variables

## Client
`.env` for `npm start`

`.env.production` for `npm run build`

### Development
```
REACT_APP_API_DOMAIN=<API-DOMAIN> # for prd, you can leave it to use relative path
```

## Backend
`.env` for both development and production

### Production
```
DB_URL=<MONGODB-URI> # mongodb+srv://...
NODE_ENV=<ENVIRONMENT> # production
SESSION_SECRET=<RANDOM-STRING> # abcABC123456
CLIENT_ID=<CLIENT-ID>
CLIENT_SECRET=<CLIENT-SECRET>
CALLBACK_URL=<CALLBACK-URL>
PORT=<PORT>
```

### Google OAuth Client ID, Secret and Callback URL
Please look at **Google Cloud Console, APIs and Services, Credentials**

# Development

## Frontend
You need Nodejs v16.15+
```
cd frontend
npm start
```
Running at http://localhost:3000

## Backend
```
cd backend
node app.js
```
Running at http://localhost:4000

# Docker*

First, prepare env files for both frontend and backend

Build
```
docker build -t postitapp .
```
