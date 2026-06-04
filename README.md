<div align="center">
  <img src="./src/assets/icon.png" alt="Auth-Pro Icon" width="128" height="128" style="border-radius: 20%">
  <h1>Auth-Pro Microservice</h1>
  <p><b>Created by Aaqil Khan</b><br>
  💼 B2B Solutions: <a href="https://solutions-with-aaqil.vercel.app/">https://solutions-with-aaqil.vercel.app/</a><br>
  🌐 Personal Portfolio: <a href="https://aaqilcodes.vercel.app/">https://aaqilcodes.vercel.app/</a></p>
</div>

Auth-Pro is a robust, production-ready authentication, email, and storage microservice designed to provide a solid foundation for modern web applications. Built using **NestJS**, **Prisma**, and **PostgreSQL (Neon DB)**, it strictly adheres to Domain-Driven Module architecture.

## 🚀 Features

- **JWT Authentication:** Secure user signup, login, and protected routes using `@nestjs/jwt` and `@nestjs/passport`.
- **Password Management:** Secure password hashing with `bcrypt` and token-based password reset flows via email.
- **Storage Integrations:** Image and avatar uploads are processed natively (via `sharp`) and uploaded to Cloudflare R2 using `@aws-sdk/client-s3`.
- **Database Architecture:** Built on top of Prisma ORM connected to Neon DB (Serverless PostgreSQL).
- **Email Delivery:** Seamlessly configured with `nodemailer` for automated email workflows.
- **Comprehensive Testing:** 110+ Unit and End-to-End (E2E) tests ensuring robust operations with mocked Prisma, Storage, and Mail services.
- **Interactive Documentation:** Custom built-in API portal with Swagger UI integration.

## 🛠️ Technology Stack

- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL (Neon DB)
- **ORM:** Prisma
- **Auth:** `@nestjs/jwt`, `passport`, `bcrypt`
- **Storage:** AWS S3 SDK (`@aws-sdk/client-s3`) connected to Cloudflare R2
- **Image Processing:** `sharp`
- **Mailing:** `nodemailer`
- **Testing:** `jest`, `supertest`

## ⚙️ Setup and Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ABDULAAQILKHAN/AUTH-PRO.git
   cd AUTH-PRO
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```
   *(Note: `sharp` is used for image compression. Ensure you have the appropriate system dependencies if you face installation issues on certain operating systems.)*

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and configure your credentials.
   ```bash
   cp .env.example .env
   ```
   
   **Where to obtain your keys:**
   - **`DATABASE_URL` & `DIRECT_URL`**: Obtain your connection strings from your [Neon DB](https://neon.tech/) project dashboard.
   - **`JWT_SECRET`**: Generate a strong, random string (e.g., using `openssl rand -base64 32`).
   - **`R2_*` keys**: Create a bucket in your [Cloudflare Dashboard](https://dash.cloudflare.com/) under R2, and generate an API token to get your access keys.
   - **`SMTP_*` keys**: Use a transactional email provider (like Resend, SendGrid, or AWS SES) to get your SMTP host, port, user, and password.
   - **`ADMIN_PASS`**: Choose a secure custom password. This acts as a master key for admin-only endpoints.
   - **`PRODUCTION`**: Set this to `true` when deploying to a live server to enable production optimizations and security. Leave as `false` for local development.
   - **`API_URL`**: The base URL where your API is hosted (e.g., `http://localhost:3000` locally, or `https://api.yourdomain.com` in production). This is required for constructing absolute URLs in email templates and redirects.

4. **Initialize Database:**
   Generate the Prisma client and push the schema to your Neon DB (or local PostgreSQL).
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 🗄️ Neon DB Database Setup (Alternative)

If you prefer to initialize your tables using raw SQL instead of Prisma commands, you can execute the following in your Neon DB console:

```sql
-- Create the User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "metadata" JSONB,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

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

ALTER TABLE "Media" ADD CONSTRAINT "Media_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## 🏃 Running the Application

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run build
npm run start:prod
```

## 🧪 Testing

Auth-Pro comes with a comprehensive suite of Unit and End-to-End (E2E) tests. All external services (Prisma Database, Cloudflare R2, Nodemailer) are heavily mocked, meaning you can run the entire test suite completely isolated without needing a real database, AWS keys, or SMTP server.

```bash
# Run all unit tests (Controllers and Services)
npm run test

# Run all E2E tests (HTTP layer validation)
npm run test:e2e

# Generate Test Coverage Report
npm run test:cov
```

## 🐳 Docker Deployment

To build the Docker image and run the application inside a container:

1. **Build the Docker Image:**
   ```bash
   docker build -t auth-pro .
   ```

2. **Run the Docker Container:**
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

Once the server is running, explore the API natively using our built-in interactive UI:
- **App Intro & Interactive Docs:** [http://localhost:3000/docs](http://localhost:3000/docs)
- **Swagger UI:** [http://localhost:3000/api](http://localhost:3000/api)

### Authentication
- `POST /auth/signup`: Registers a new user. Payload: `{ email, password, metadata?, redirectUrl }`
- `POST /auth/login`: Authenticates a user and returns a JWT token. Payload: `{ email, password }`
- `POST /auth/forgot-password`: Requests a password reset email. Payload: `{ email, redirectUrl }`
- `POST /auth/update-password`: Resets a password using a token. Payload: `{ token, newPassword }`
- `GET /auth/verify-email`: Verifies a user's email via query `token` and redirects to `redirectUrl`.
- `GET /auth/reset-password`: Formats reset password redirect to frontend.

### User Management
- `GET /users/me`: Gets the profile of the currently authenticated user. Header: `Authorization: Bearer <token>`
- `PATCH /users/me`: Deep-merges custom metadata for the authenticated user. Payload: `{ metadata }`
- `POST /users/avatar`: Uploads a profile avatar to Cloudflare R2. Payload: form-data `file`
- `POST /users/ban`: Bans a user (Admin). Payload: `{ adminPass, userId }`

### Mailing Services
- `POST /mail/send-custom`: Sends a custom HTML email (Admin). Payload: `{ adminPass, to, subject, htmlTemplate }`

### Media Upload
- `POST /media/images`: Uploads an image, categorizes it with a `tag`, and saves it to cloud storage. Payload: `multipart/form-data` with `file` and `tag`. Header: `Authorization: Bearer <token>`
- `GET /media`: Lists all media files uploaded by the current user. Accepts optional `?tag=` query to filter.
- `GET /media/:id`: Retrieves detailed metadata for a specific media file.
- `DELETE /media/:id`: Deletes a specific media file permanently.

**Media Flow Explained:**
When calling `POST /media/images`, the backend extracts the file buffer and pipes it into `sharp` to resize its maximum width to 1920px and convert it to a highly-compressed WebP format. This drastically reduces bandwidth usage. Next, the compressed buffer is directly uploaded to Cloudflare R2 (S3). A database record is inserted into the `Media` table containing the R2 public URL, user details, and the categorizing `tag`.

## 🤝 Contributing
Auth-Pro is an open-source project and contributions are very welcome! Please read the [CONTRIBUTING.md](./CONTRIBUTING.md) file for details on our code of conduct and the process for submitting pull requests.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
