# Auth-Pro Microservice

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
```

## ⚙️ Setup and Installation

1. **Install Dependencies:**
   ```bash
   npm install
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

## 📚 API Documentation

Once the server is running, navigate to the following URL to explore the API documentation via Swagger UI:

- **Swagger UI:** [http://localhost:3000/api](http://localhost:3000/api)
- **App Intro:** [http://localhost:3000/](http://localhost:3000/)
