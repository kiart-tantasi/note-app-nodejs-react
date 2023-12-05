# Environment Variables

## Frontend (OPTIONAL)
Create file `.env` in `./frontend/`
```
REACT_APP_API_DOMAIN=<API-DOMAIN>
```

## Backend
Create file `.env` in `./backend/`
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
npm start # You need to use Nodejs version 16.15+
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

# Docker*
Now this project is designed to run in EC2 instance directly and not through containerization. I left Dockerfile that I used in case I might need it in the future.

# EC2 Manual Deployment

- Prepare `.env` file in both frontend and backend folder

- Build frontend by command `npm run build` and put generated build folder in backend folder

- Put file `app.service at` `/etc/systemd/system/`

- Run `sudo systemctl start app.service` (you can change `start` to `stop`, `restart`, and `status`)

- Put `ssl_certificate.pem` and `ssl_certificate_key.pem` at `/etc/ssl`. You can generate both of them from Cloudflare

- Copy `nginxec2debian.conf` and Paste at `/etc/nginx/nginx.conf`

- Run `sudo systemctl start nginx` to start app at port 443
