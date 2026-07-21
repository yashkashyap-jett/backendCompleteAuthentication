# Auth Backend Learning

An Express and MongoDB authentication API that supports registration, email OTP verification, login, JWT access tokens, refresh-token sessions, and logout.

## Features

- User registration with hashed passwords
- Email verification using a six-digit OTP
- JWT access tokens (15 minutes)
- Refresh-token sessions (7 days) stored in an HTTP-only cookie
- Token refresh, logout, and logout-from-all-sessions endpoints
- Gmail email delivery through Nodemailer OAuth2

## Requirements

- Node.js
- MongoDB connection URI
- Gmail OAuth2 credentials for sending verification emails

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:

   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SEC=your_long_random_jwt_secret
   CLIENT_ID=your_google_oauth_client_id
   CLIENT_SEC=your_google_oauth_client_secret
   GOOGLE_REFRESH_TOKEN=your_google_oauth_refresh_token
   GOOGLE_USER=your_gmail_address
   ```

3. Start the server:

   ```bash
   node server.js
   ```

The API listens on `http://localhost:3000`.

## API routes

All routes are prefixed with `/api/auth`.

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/register` | Create an account and send a verification OTP. |
| `POST` | `/verify-email` | Verify an account using its email and OTP. |
| `POST` | `/login` | Log in and receive an access token. |
| `GET` | `/get-me` | Get the authenticated user's profile. |
| `GET` | `/refresh-token` | Exchange the refresh-token cookie for a new access token. |
| `GET` | `/logout` | Revoke the current refresh-token session. |
| `GET` | `/logout-all` | Revoke all sessions for the current user. |

## Example requests

Register:

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "jane",
  "email": "jane@example.com",
  "password": "secure-password"
}
```

Verify email:

```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "jane@example.com",
  "otp": "123456"
}
```

For protected requests, send the access token as a Bearer token:

```http
Authorization: Bearer <access-token>
```

## Project structure

```text
server.js                  # Application entry point
src/
  app.js                   # Express configuration
  routes/                  # Authentication routes
  controllers/             # Route handlers
  model/                   # Mongoose user, session, and OTP models
  config/                  # Environment and database configuration
  services/                # Email service
  utils/                   # OTP helpers
```
