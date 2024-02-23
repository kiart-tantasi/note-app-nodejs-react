# Demo

<img src="/demos/demo-1.png" alt="App demo" height="800px" />

# Environment Variables

## Client
`.env` for `npm start`

`.env.production for `npm run build`
```
REACT_APP_API_DOMAIN=<API-DOMAIN> # https://www.example.com
```

## Backend
`.env` for both development and production (`node app.js`)
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

## Frontned
```
cd frontend
npm start # You need to use Nodejs version 16.15+
```
Running at http://localhost:3000

## Backend
```
cd backend
node app.js
```
Running at http://localhost:4000

## NOTE
Cannot use Google OAuth in development environment

# Docker*

First, prepare env files for both frontend and backend

Build
```
docker build -t postitapp .
```
