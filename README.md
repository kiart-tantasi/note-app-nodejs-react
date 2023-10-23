# Environment Variables

## Frontend
`.env.development` or `.env.production`
```
REACT_APP_API_DOMAIN=<API-DOMAIN>
```

## Backend
Create file `.env.local` in `./backend/`
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

## frontned
```
cd frontend
npm start # You need to use Nodejs version 16.15
```
Running at http://localhost:3000

## backend
```
cd backend
node app.js
```
Running at http://localhost:4000

## NOTE
Cannot use Google OAuth in development environment

# Production

This project contains both frontend (SPA React) and backend(Nodejs) together in one image


## Https
To use https, you need to put certificate.pem and private_key.pem in `./certificates/`.
If you do not need to use, please remove nginx steps in Dockerfile

Build image
```
docker build -t app .
```

Run
```
docker run -p 443:443 -p 80:80 app
```
