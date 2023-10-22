# Environment Variables

Create file `.env.local` with these values
```
DB_URL=<MONGODB-URI> # mongodb+srv://...
NODE_ENV=<ENVIRONMENT> # production
SESSION_SECRET=<RANDOM-STRING> # abcABC123456
CLIENT_ID=<CLIENT-ID>
CLIENT_SECRET=<CLIENT-SECRET>
CALLBACK_URL=<CALLBACK-URL>
PORT=<PORT>
```
## Google OAuth Client ID, Secret and Callback URL
Please look at **Google Cloud Console, APIs and Services, Credentials**

# Run app in development and production
```
node app.js
```
