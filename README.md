# Environment Variables

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
npm start
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

Build image
```
docker build -t name .
```

Run
```
docker run -p 4000:4000 name
```

# Todo

- Install Nginx and use certs
