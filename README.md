<div align="center">
  <img src="./src/assets/icon.png" alt="Auth-Pro Icon" width="128" height="128" style="border-radius: 20%">
  <h1>Auth-Pro Microservice</h1>
</div>

Auth-Pro is a personal authentication, email, and storage microservice designed to provide a robust foundation for modern web applications. It is built using **NestJS**, **Prisma**, and **PostgreSQL (Neon DB)**, incorporating best practices like strict Domain-Driven Module architecture.

## 🚀 Features

- **JWT Authentication:** Secure user signup, login, and protected routes using `@nestjs/jwt` and `@nestjs/passport`.
- **Password Management:** Secure password hashing with `bcrypt` and token-based password reset flow via email.
- **Storage Integrations:** Image and avatar uploads are securely handled and uploaded to Cloudflare R2 using `@aws-sdk/client-s3`.
- **Database Architecture:** Built on top of Prisma ORM connected to Neon DB (Serverless PostgreSQL).
- **Email Delivery:** Seamlessly configured with Nodemailer for automated email flows (like password resets).
- **Swagger Documentation:** Automatically generated and deeply integrated API documentation using `@nestjs/swagger`.

## 🛠️ Technology Stack

- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL (Neon DB)
- **ORM:** Prisma
- **Auth:** `@nestjs/jwt`, `passport`, `bcrypt`
- **Storage:** AWS S3 SDK (`@aws-sdk/client-s3`) connected to Cloudflare R2
- **Mailing:** `nodemailer`

## 🗄️ Neon DB Database Setup

If you prefer to initialize your tables using raw SQL instead of relying on `npx prisma db push` or `npx prisma migrate dev`, you can execute the following SQL queries directly in the Neon DB console to create the necessary tables for Auth-Pro:

```sql
-- Create the User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Ensure that emails are unique
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Create the Media table
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- Add Foreign Key constraint
ALTER TABLE "Media" ADD CONSTRAINT "Media_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## ⚙️ Setup and Installation

1. **Install Dependencies:**
   ```bash
   npm install
   npm install sharp
   npm install -D @types/sharp
   ```

2. **Configure Environment Variables:**
   Copy the provided `.env.example` file to `.env` and fill out your Neon DB, JWT, Cloudflare R2, and SMTP configurations.
   ```bash
   cp .env.example .env
   ```

3. **Generate Prisma Client:**
   Ensure the Prisma client is synced with the current schema.
   ```bash
   npx prisma generate
   ```

## 🏃 Running the Application

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## 🐳 Docker Deployment

To build the Docker image and spin up the application inside a container, follow these steps:

1. **Build the Docker Image:**
   This will compile your application and package it into a lightweight Node image.
   ```bash
   docker build -t auth-pro .
   ```

2. **Run the Docker Container:**
   Run the container on port 3000, passing the environment variables from your `.env` file.
   ```bash
   docker run -d -p 3000:3000 --env-file .env --name auth-pro-app auth-pro
   ```
   > [!NOTE]
   > Make sure your `.env` variables point to accessible network resources. If using a local database on your host, you may need to use `host.docker.internal` in your `DATABASE_URL` instead of `localhost`.

3. **Check Container Status:**
   ```bash
   docker logs auth-pro-app
   ```

## 📚 API Documentation

Once the server is running, explore the API natively using our built-in UI:
- **App Intro & Interactive Docs:** [http://localhost:3000/docs](http://localhost:3000/docs)
- **Swagger UI:** [http://localhost:3000/api](http://localhost:3000/api)

### Authentication
- `POST /auth/signup`: Registers a new user. Payload: `{ email, password, firstName, lastName, redirectUrl? }`
- `POST /auth/login`: Authenticates a user and returns a JWT token. Payload: `{ email, password }`
- `POST /auth/forgot-password`: Requests a password reset email. Payload: `{ email, redirectUrl? }`
- `POST /auth/update-password`: Resets a password using a token. Payload: `{ token, newPassword }`
- `GET /auth/verify-email`: Verifies a user's email via query `token` and redirects to `redirectUrl`.
- `GET /auth/reset-password`: Formats reset password redirect to frontend.

### User Management
- `GET /users/me`: Gets the profile of the currently authenticated user. Header: `Authorization: Bearer <token>`
- `PATCH /users/me`: Updates metadata for the currently authenticated user. Payload: `{ metadata }`
- `POST /users/avatar`: Uploads a profile avatar to Cloudflare R2/S3. Payload: form-data `file`
- `POST /users/ban`: Bans a user (Admin). Payload: `{ adminPass, userId }`

### Mailing Services
- `POST /mail/send-custom`: Sends a custom HTML email (Admin). Payload: `{ adminPass, to, subject, htmlTemplate }`

### Media Upload
- `POST /media/images`: Uploads an image, compresses it to WebP natively using `sharp`, and saves it to cloud storage. Payload: `multipart/form-data` with `file` and `tag`. Header: `Authorization: Bearer <token>`
- `GET /media`: Lists all media files uploaded by the current user. Accepts optional `?tag=` query to filter.
- `GET /media/:id`: Retrieves detailed metadata for a specific media file.
- `DELETE /media/:id`: Deletes a specific media file from cloud storage and the database.

**Media Flow Explained:**
When a user calls `POST /media/images`, the server receives the file via a multipart form data payload. The backend extracts the file buffer and immediately pipes it into `sharp` to resize its maximum width to 1920px and convert it to a highly-compressed WebP format. This severely reduces bandwidth usage and storage costs. Next, the compressed buffer is directly uploaded to Cloudflare R2 (S3) via the `@aws-sdk/client-s3` library. A database record is then inserted into the `Media` table containing the R2 public URL, user details, and the mandatory categorizing `tag`. Finally, the client receives the media's metadata and URL for immediate use.
