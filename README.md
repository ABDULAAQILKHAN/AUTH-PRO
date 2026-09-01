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
- **Security Hardening:** HTTP security headers via `helmet`, three-tier global rate limiting via `@nestjs/throttler`, per-endpoint throttle overrides, and a 1 MB JSON payload cap.
- **Comprehensive Testing:** 130+ Unit and End-to-End (E2E) tests ensuring robust operations with mocked Prisma, Storage, and Mail services — including a dedicated security test suite.
- **Interactive Documentation:** Custom built-in API portal with Swagger UI integration.

## 🛠️ Technology Stack

- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL (Neon DB)
- **ORM:** Prisma
- **Auth:** `@nestjs/jwt`, `passport`, `bcrypt`
- **Security:** `helmet`, `@nestjs/throttler`
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

3. **Start the app and open the built-in Setup Dashboard:**
   Auth-Pro boots fine even with an empty `.env` — you don't need to configure anything up front.
   ```bash
   npm run start:dev
   ```
   Then open **[http://localhost:3000](http://localhost:3000)** in your browser. The Setup Dashboard shows every environment variable the app uses, grouped by category, with a live "configured / missing / using default" status for each and an expandable step-by-step guide for obtaining each value.

   Copy `.env.example` to `.env` and fill it in as you go, then restart the dev server — the dashboard updates automatically to reflect what's set.
   ```bash
   cp .env.example .env
   ```

   **Reference: where to obtain each key** (same info as the dashboard, for offline reading):
   - **`DATABASE_URL` & `DIRECT_URL`**: Obtain your connection strings from your [Neon DB](https://neon.tech/) project dashboard.
   - **`JWT_SECRET`**: Generate a strong, random string (e.g., using `openssl rand -base64 32`).
   - **`R2_*` keys**: Create a bucket in your [Cloudflare Dashboard](https://dash.cloudflare.com/) under R2, and generate an API token to get your access keys.
   - **`SMTP_*` keys**: Use a transactional email provider (like Resend, SendGrid, or AWS SES) to get your SMTP host, port, user, and password.
   - **`ADMIN_PASS`**: Choose a secure custom password. This acts as a master key for admin-only endpoints.
   - **`PRODUCTION`**: Set this to `true` when deploying to a live server to enable production optimizations and security. Leave as `false` for local development.
   - **`API_URL`**: The base URL where your API is hosted (e.g., `http://localhost:3000` locally, or `https://api.yourdomain.com` in production). This is required for constructing absolute URLs in email templates and redirects.
   - **`PORT`** *(optional)*: Which port the server listens on. Defaults to `3000`.
   - **`FRONTEND_URL`** *(optional)*: Alternate base URL for email links if your frontend is hosted separately from the API.

4. **Initialize the database:**
   Generate the Prisma client and push the schema to your Neon DB (or local PostgreSQL) — this step still requires `DATABASE_URL`/`DIRECT_URL` to be set in `.env`.
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

## 🔒 Security Hardening

Auth-Pro ships with several production-grade security layers enabled by default.

### HTTP Security Headers (helmet)

Every response includes the following headers, set automatically by `helmet`:

| Header | Value | Purpose |
|---|---|---|
| `X-Frame-Options` | `SAMEORIGIN` | Prevents clickjacking |
| `X-Content-Type-Options` | `nosniff` | Blocks MIME-type sniffing |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Enforces HTTPS |
| `Content-Security-Policy` | custom (allows Tailwind CDN + Google Fonts; blocks everything else) | Mitigates XSS |
| `Referrer-Policy` | `no-referrer` | Controls referrer leakage |
| `X-Powered-By` | *(removed)* | Hides tech fingerprint |

### Rate Limiting (ThrottlerModule)

Three global tiers apply to every endpoint simultaneously. A request is only allowed through if it passes **all** tiers. Any one tier can issue a `429 Too Many Requests`.

| Tier | Window | Limit | Purpose |
|---|---|---|---|
| `short` | 1 second | 5 requests | Burst / brute-force protection |
| `default` | 60 seconds | 60 requests | Per-minute traffic cap |
| `long` | 1 hour | 500 requests | Hourly abuse cap |

#### Per-Endpoint Overrides

Sensitive endpoints override the `default` tier with tighter limits:

| Endpoint | Limit | Reason |
|---|---|---|
| `POST /auth/login` | 5 req / min | Brute-force credential guessing |
| `POST /auth/signup` | 3 req / hr | Bulk account creation |
| `POST /auth/forgot-password` | 3 req / hr | Email flooding |
| `POST /users/ban` | 5 req / min | Admin credential guessing |
| `POST /mail/send-custom` | 10 req / hr | SMTP abuse |

### Additional Protections

- **JSON payload cap:** `express.json({ limit: '1mb' })` — oversized bodies are rejected with `413 Payload Too Large` before they reach any controller. Multer file uploads are unaffected (they bypass the JSON parser entirely).
- **Input validation:** `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` — unknown fields in any request body return `400 Bad Request` immediately.
- **Proxy trust:** `app.set('trust proxy', 1)` ensures the real client IP is read from `X-Forwarded-For` when running behind an ingress or load balancer, so rate limiting correctly tracks unique clients rather than the proxy IP.

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

Auth-Pro ships with **130+ tests** across three layers. All external services (Prisma, Cloudflare R2, Nodemailer) are mocked — no real database, storage, or SMTP server is needed to run the full suite.

```bash
# Run all unit tests (Controllers and Services)
npm run test

# Run all E2E tests (HTTP layer + security)
npm run test:e2e

# Generate a coverage report
npm run test:cov
```

### Test Suites

#### Unit Tests (`src/**/*.spec.ts`)

Controller and service logic is tested in isolation with Jest mocks.

| File | What is tested |
|---|---|
| `auth.controller.spec.ts` | signup, login, forgot-password, update-password, verify-email, reset-password redirect |
| `auth.service.spec.ts` | JWT signing, bcrypt comparison, token generation, email enumeration protection |
| `users.controller.spec.ts` | getProfile, updateProfile, uploadAvatar, banUser (admin password check) |
| `users.service.spec.ts` | findById, updateAvatar, metadata deep-merge, banUser |
| `mail.controller.spec.ts` | sendCustomEmail (admin auth, SMTP propagation) |
| `mail.service.spec.ts` | sendVerificationEmail, sendPasswordResetEmail, sendCustomEmail |
| `media.controller.spec.ts` | image upload, list, get by id, delete (ownership enforcement) |
| `media.service.spec.ts` | storage upload, DB record creation, access control |

#### E2E Tests (`test/app.e2e-spec.ts`)

Full HTTP round-trips through the real NestJS request pipeline with mocked external providers.

| Endpoint group | Scenarios covered |
|---|---|
| `GET /` | Setup Dashboard renders, shows live env var status |
| `GET /docs` | API documentation page renders correctly |
| `POST /auth/signup` | 201 success, 400 weak password, 400 duplicate email, 400 missing field |
| `POST /auth/login` | 200 success, 401 wrong password, 401 unknown user, 401 banned user |
| `POST /auth/forgot-password` | 200 always (enumeration-safe), reset email sent |
| `POST /auth/update-password` | 200 valid token, 400 expired token |
| `GET /users/me` | 200 with profile, 401 no token |
| `PATCH /users/me` | 200 metadata update, 401 no token |
| `POST /users/avatar` | 201 upload success, 401 no token |
| `POST /users/ban` | 200 ban success, 401 wrong admin pass |
| `POST /mail/send-custom` | 200 success, 401 wrong admin pass |
| `POST /media/images` | 201 upload, 401 no token |
| `GET /media` | 200 list, tag filter, empty array, 401 no token |
| `GET /media/:id` | 200 owned file, 404 other user's file, 401 no token |
| `DELETE /media/:id` | 200 owned delete, 404 other user's file, 401 no token |

#### Security E2E Tests (`test/security.e2e-spec.ts`)

Validates the security hardening layer end-to-end against a fully booted app with all middleware active.

**HTTP Headers & Input Hardening:**

| Test | Asserts |
|---|---|
| `X-Frame-Options: SAMEORIGIN` | helmet header present |
| `X-Content-Type-Options: nosniff` | helmet header present |
| `Strict-Transport-Security` | HSTS header with `max-age` present |
| `Content-Security-Policy` | CSP header present |
| `Referrer-Policy` | header present |
| `X-DNS-Prefetch-Control: off` | header present |
| No `X-Powered-By` | tech fingerprint removed |
| Unknown field in body → `400` | `forbidNonWhitelisted` on login, signup, ban, send-custom |
| Missing required field → `400` | `ValidationPipe` enforcement |
| Weak password → `400` | DTO password-strength validator |
| Body > 1 MB → `413` | `express.json({ limit: '1mb' })` middleware |

**Rate Limiting:**

| Endpoint | Limit tested | How |
|---|---|---|
| `POST /auth/login` | 5 req / min | 5 requests → not 429, 6th → 429 |
| `POST /auth/signup` | 3 req / hr | 3 requests → not 429, 4th → 429 |
| `POST /auth/forgot-password` | 3 req / hr | 3 requests → not 429, 4th → 429 |
| `POST /users/ban` | 5 req / min | 5 requests → not 429, 6th → 429 |
| `POST /mail/send-custom` | 10 req / hr | 10 requests in 2 batches (with 1.1 s gap to reset the 5 req/sec burst tier), 11th → 429 |

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
- **Setup Dashboard:** [http://localhost:3000](http://localhost:3000)
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
