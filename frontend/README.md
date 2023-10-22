# Post-It-App-Simple-MERN-App

Note App (Web Application) in Post It Note Style

MERN Stack: MongoDB (Mongoose) + Express + React + NodeJS.

# Run

## Without docker

1. Start this client app at http://localhost:3000 by command `npm start`

2. Step 1 should be enough to run app in offline way which app can store data in local storage. If you want to store data in actual MongoDB and use Google Auth for logging-in, you have to follow step 3

3. (Optional) Run this [Nodejs API](https://github.com/kiart-tantasi/note-app-nodejs-server) at port 4000 and point this client app to it

## With docker but Without Nodejs API

1. Prepare these SSL certificates

- certificates/certificate.pem
- certificates/private_key.pem

    The easiest way to get these is to get it from **Cloudflare's Origin Server Certificates**

2. Build docker image

```
docker build -t postitapp .
```

3. Start container

```
docker run -p 443:443 postitapp
```

4. Try

https://localhost

# Production

Now prod app is not yet connected to Nodejs API which means it cannot store any data to actual MongoDB and cannot use Google Auth to logging-in.
