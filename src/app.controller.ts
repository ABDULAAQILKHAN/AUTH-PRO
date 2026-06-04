import { Controller, Get, Res } from '@nestjs/common';
import { join } from 'path';
import type { Response } from 'express';

@Controller()
export class AppController {
  @Get('icon.png')
  getIcon(@Res() res: Response) {
    res.sendFile(join(__dirname, 'assets', 'icon.png'));
  }

  @Get('favicon.ico')
  getFavicon(@Res() res: Response) {
    res.sendFile(join(__dirname, 'assets', 'icon.png'));
  }

  @Get()
  getHello(@Res() res: Response) {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Auth-Pro | The Ultimate Authentication Microservice</title>
          <link rel="icon" href="/favicon.ico">
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
          <style>
              body { font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f8fafc; }
              .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
              .text-gradient { background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
              .bg-gradient-custom { background: linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%); }
          </style>
      </head>
      <body class="min-h-screen flex flex-col relative overflow-hidden">
          <!-- Background decoration -->
          <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
          <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

          <!-- Navbar -->
          <nav class="w-full glass z-10 px-8 py-4 flex justify-between items-center sticky top-0">
              <div class="flex items-center gap-3">
                  <img src="/icon.png" alt="Auth-Pro Icon" class="w-10 h-10 rounded-lg shadow-lg shadow-sky-500/20">
                  <div class="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 text-gradient">Auth-Pro</div>
              </div>
              <div>
                  <a href="/docs" class="px-6 py-2 rounded-full border border-sky-400/50 hover:bg-sky-400/10 transition duration-300 text-sky-400 font-medium">Docs</a>
              </div>
          </nav>

          <!-- Hero Section -->
          <main class="flex-grow flex flex-col justify-center items-center px-4 text-center z-10 py-20">
              <h1 class="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                  Secure <span class="bg-gradient-to-r from-sky-400 to-blue-500 text-gradient">Authentication</span><br/>Made Simple.
              </h1>
              <p class="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
                  A high-performance, developer-friendly microservice for managing user identities, JWTs, and secure email workflows. Ready to integrate into any application.
              </p>

              <!-- Features Grid -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-8">
                  <div class="glass p-8 rounded-2xl text-left hover:-translate-y-2 transition duration-300">
                      <div class="w-12 h-12 rounded-lg bg-sky-500/20 flex items-center justify-center mb-4 text-sky-400">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                      </div>
                      <h3 class="text-xl font-semibold mb-2">JWT & RBAC</h3>
                      <p class="text-slate-400 text-sm">Secure stateless sessions via JWT with built-in Role-Based Access Control integration.</p>
                  </div>
                  <div class="glass p-8 rounded-2xl text-left hover:-translate-y-2 transition duration-300">
                      <div class="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      </div>
                      <h3 class="text-xl font-semibold mb-2">Automated Emails</h3>
                      <p class="text-slate-400 text-sm">Ready-to-use email verification and password reset workflows with deep-link redirection.</p>
                  </div>
                  <div class="glass p-8 rounded-2xl text-left hover:-translate-y-2 transition duration-300">
                      <div class="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                      </div>
                      <h3 class="text-xl font-semibold mb-2">Developer First</h3>
                      <p class="text-slate-400 text-sm">Copy-paste prompts to immediately integrate Auth-Pro into your frontend with Agentic AI.</p>
                  </div>
              </div>
          </main>
      </body>
      </html>
    `;
    res.type('text/html').send(html);
  }

  @Get('docs')
  getDocs(@Res() res: Response) {
    const base = process.env.API_URL || 'http://localhost:3000';

    const aiPrompt = `You are an expert AI coding assistant helping the user integrate Auth-Pro into their frontend application.

BASE URL: ${base}
All requests use JSON bodies unless noted as multipart/form-data.
Protected routes require the header:  Authorization: Bearer <accessToken>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUTH ENDPOINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. POST /auth/signup
   Body: {
     email: string,           // required
     password: string,        // required — min 8 chars, must include uppercase, lowercase, number & special char (@$!%*?&)
     redirectUrl: string,     // required — your frontend page user lands on after clicking the verification email (no token appended)
     metadata?: object        // optional — any JSON data to attach to the user (name, phone, plan, etc.)
   }
   Response: { accessToken: string }
   Notes: User is immediately logged in via the returned token. Email is NOT verified yet.
          The verification email link points to GET /auth/verify-email which then redirects to your redirectUrl.

2. POST /auth/login
   Body: { email: string, password: string }
   Response: { accessToken: string }
   Notes: Store the token in localStorage. Use it for all protected requests.
          Returns 401 if credentials are wrong or user is banned.

3. POST /auth/forgot-password
   Body: { email: string, redirectUrl: string }
   Response: { message: string }
   Notes: Sends a reset email. The link in the email hits GET /auth/reset-password which redirects to
          YOUR redirectUrl with ?token=TOKEN appended. Then call POST /auth/update-password.
          Response is always the same message regardless of whether email exists (prevents enumeration).

4. POST /auth/update-password
   Body: { token: string, newPassword: string }
   Response: { message: string }
   Notes: Use on your reset-password page. Extract token from URL:
            const token = new URLSearchParams(window.location.search).get('token');
          Tokens are single-use and expire. Returns 400 for invalid/expired tokens.

5. GET /auth/verify-email?token=TOKEN&redirectUrl=URL
   Notes: NOT called in code — the user clicks this link from their inbox.
          Auth-Pro marks email as verified then redirects to your redirectUrl.

6. GET /auth/reset-password?token=TOKEN&redirectUrl=URL
   Notes: NOT called in code — the user clicks this from the forgot-password email.
          Auth-Pro appends the token to your redirectUrl and redirects.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER ENDPOINTS  (require Authorization: Bearer <token>)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. GET /users/me
   Response: { id, email, avatarUrl, metadata, isEmailVerified, createdAt, updatedAt }
   Notes: password is NEVER returned. Returns 401 if token is invalid/expired.

8. PATCH /users/me
   Body: { metadata?: object }
   Response: updated UserEntity
   Notes: DEEP MERGE — only keys you send are updated, existing keys are preserved.
          To delete a key send it as null: { metadata: { keyToRemove: null } }

9. POST /users/avatar    [multipart/form-data]
   Form fields: file (required) — image file (JPG, PNG, WebP, etc.)
   Response: updated UserEntity with new avatarUrl
   Notes: Do NOT set Content-Type manually — FormData sets it automatically.
          Image is auto-compressed to WebP. Use user.avatarUrl to display the result.

10. POST /users/ban    [Admin — no JWT needed]
    Body: { adminPass: string, userId: string }
    Response: updated UserEntity
    Notes: adminPass must match the ADMIN_PASS env variable. Never expose in a public frontend.
           userId comes from GET /users/me (id field) or your database.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MAIL ENDPOINTS  (Admin — no JWT needed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

11. POST /mail/send-custom
    Body: { adminPass: string, to: string, subject: string, htmlTemplate: string }
    Response: { message: string }
    Notes: Sends a fully custom HTML email. Use inline CSS for best email client compatibility.
           adminPass must match ADMIN_PASS env variable.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MEDIA ENDPOINTS  (require Authorization: Bearer <token>)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

12. POST /media/images    [multipart/form-data]
    Form fields: file (required) — image file; tag (required) — category label (e.g. "blog-thumbnails")
    Response: MediaEntity { id, url, tag, mimeType, size, filename, createdAt }
    Notes: Builds a per-user media library. Different from /users/avatar (which is one profile picture).
           Images are auto-compressed to WebP. Save the returned id if you need to delete later.
           Do NOT set Content-Type manually.

13. GET /media?tag=OPTIONAL_TAG
    Response: MediaEntity[]  (empty array if none found — not 404)
    Notes: Returns all media for the user. Filter by tag with ?tag=your-tag.

14. GET /media/:id
    Response: MediaEntity
    Notes: Returns a single file by ID. Only returns files owned by the authenticated user.

15. DELETE /media/:id
    Response: { message: "Media successfully deleted" }
    Notes: PERMANENT — deletes from both database and cloud storage. Cannot be undone.
           Only the owner can delete their own files.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KEY RULES & PATTERNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Password strength: min 8 chars, must contain at least one uppercase letter, one lowercase letter,
  one number, and one special character from: @$!%*?&

Token storage: store accessToken from login/signup in localStorage (or a secure cookie).
  Attach to every protected request as:  Authorization: Bearer <token>

metadata field: free-form JSON object on each user. Use it to store anything you need — name,
  phone, plan, preferences, onboarding state, etc. PATCH /users/me deep-merges updates.

Email verification flow:
  signup (with redirectUrl) → user gets email → clicks link → /auth/verify-email → redirects to your app

Password reset flow:
  forgot-password (with redirectUrl) → user gets email → clicks link → /auth/reset-password
  → redirects to YOUR redirectUrl?token=TOKEN → your page reads token → update-password

Admin authentication: endpoints /users/ban and /mail/send-custom use adminPass (not JWT).
  adminPass must match the ADMIN_PASS environment variable on the server.
`;

    type Ep = {
      method: string; path: string; title: string; description: string;
      auth: boolean; admin: boolean;
      payloadLabel: string; payload: string;
      howToUse: string; exampleCode: string;
    };

    const endpoints: Ep[] = [
      {
        method: 'POST', path: '/auth/signup',
        title: 'Register a New User',
        description: 'Creates a new user account and immediately sends an email verification link to the provided address.',
        auth: false, admin: false,
        payloadLabel: 'Request Body (JSON)',
        payload: `{
  "email": "user@example.com",            // required
  "password": "MyP@ssword1",              // required — min 8 chars, must include uppercase,
                                          //   lowercase, number & special char (@$!%*?&)
  "redirectUrl": "https://yourapp.com/dashboard", // required — your frontend page the user
                                          //   lands on AFTER clicking the verification email link
  "metadata": {                           // optional — any custom JSON data to attach to the user
    "name": "John Doe",
    "phone": "+1234567890",
    "plan": "free",
    "referralCode": "ABC123"
  }
}`,
        howToUse: `Call this on your signup form submission.<br><br>
<strong>email</strong> and <strong>password</strong> are required. Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character (<code>@$!%*?&amp;</code>).<br><br>
<strong>redirectUrl</strong> is the page on YOUR app that the user lands on after clicking the verification link in their email. Auth-Pro redirects there cleanly — no token is appended to this URL.<br><br>
<strong>metadata</strong> accepts any JSON object. Store name, phone, role, plan, or anything else you need. These fields can be updated later with <code>PATCH /users/me</code> and are deep-merged on every update.<br><br>
The response returns an <code>accessToken</code> (JWT) immediately, so the user is logged in right away — even before verifying their email. Their <code>isEmailVerified</code> field will be <code>false</code> until they click the link.`,
        exampleCode: `fetch('${base}/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'MyP@ssword1',
    redirectUrl: 'https://yourapp.com/dashboard',
    metadata: {
      name: 'John Doe',
      plan: 'free'
    }
  })
})
.then(res => res.json())
.then(data => {
  // Save the token — required for all protected routes
  localStorage.setItem('token', data.accessToken);
  console.log('Signed up successfully!');
});`,
      },

      {
        method: 'POST', path: '/auth/login',
        title: 'Login User',
        description: 'Authenticates an existing user with email and password and returns a JWT access token.',
        auth: false, admin: false,
        payloadLabel: 'Request Body (JSON)',
        payload: `{
  "email": "user@example.com",  // required
  "password": "MyP@ssword1"     // required
}

// Response:
// { "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }`,
        howToUse: `Call this when the user submits your login form.<br><br>
On success you receive <code>{ "accessToken": "eyJ..." }</code>. <strong>Store this token</strong> in <code>localStorage</code> or a secure cookie — you need it for every protected API call.<br><br>
Attach it to protected requests via the header:<br>
<code>Authorization: Bearer &lt;your-token&gt;</code><br><br>
The token is a standard JWT. You can decode it client-side (e.g. using the <code>jwt-decode</code> library) to read the user's <code>userId</code> from the <code>sub</code> claim — no extra API call needed.<br><br>
Returns <strong>401 Unauthorized</strong> if the credentials are wrong or if the user has been banned.`,
        exampleCode: `fetch('${base}/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'MyP@ssword1'
  })
})
.then(res => {
  if (!res.ok) throw new Error('Invalid credentials');
  return res.json();
})
.then(data => {
  // Save the token — needed for all protected routes
  localStorage.setItem('token', data.accessToken);
  window.location.href = '/dashboard';
})
.catch(err => alert('Login failed: ' + err.message));`,
      },

      {
        method: 'POST', path: '/auth/forgot-password',
        title: 'Forgot Password',
        description: 'Sends a secure, single-use password reset link to the user\'s email address.',
        auth: false, admin: false,
        payloadLabel: 'Request Body (JSON)',
        payload: `{
  "email": "user@example.com",                         // required
  "redirectUrl": "https://yourapp.com/reset-password"  // required — your frontend reset-password page
}

// Response (always the same, regardless of whether the email exists):
// { "message": "If the email exists, a reset link has been sent." }`,
        howToUse: `Call this when the user clicks "Forgot Password?" on your login page.<br><br>
Auth-Pro generates a short-lived reset token and emails the user a link pointing to:<br>
<code>GET /auth/reset-password?token=TOKEN&amp;redirectUrl=YOUR_URL</code><br><br>
That link redirects the user to YOUR <code>redirectUrl</code> with the token appended:<br>
<code>https://yourapp.com/reset-password?token=abc123xyz</code><br><br>
Your reset page must then:<br>
1. Read <code>token</code> from the URL: <code>new URLSearchParams(window.location.search).get('token')</code><br>
2. Show a "New Password" input<br>
3. Call <code>POST /auth/update-password</code> with the token and new password<br><br>
The response is always the same message — even if the email doesn't exist. This prevents email enumeration attacks.`,
        exampleCode: `fetch('${base}/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    // This is YOUR frontend reset page — the user will land here with ?token=...
    redirectUrl: 'https://yourapp.com/reset-password'
  })
})
.then(res => res.json())
.then(data => {
  // Always show this message regardless of whether email exists
  alert('Check your inbox for a password reset link!');
  console.log(data.message);
});`,
      },

      {
        method: 'POST', path: '/auth/update-password',
        title: 'Update / Reset Password',
        description: 'Sets a new password using the one-time reset token delivered via the forgot-password email.',
        auth: false, admin: false,
        payloadLabel: 'Request Body (JSON)',
        payload: `{
  "token": "abc123xyz...",         // required — the token from your URL query param (?token=...)
  "newPassword": "NewP@ssword1"    // required — same strength rules as signup:
                                   //   min 8 chars, uppercase, lowercase, number, special char
}

// Response on success:
// { "message": "Password successfully updated." }`,
        howToUse: `Use this on your frontend reset-password page — the one you set as <code>redirectUrl</code> in the forgot-password call.<br><br>
<strong>Step 1 — Extract the token on page load:</strong><br>
<code>const token = new URLSearchParams(window.location.search).get('token');</code><br><br>
<strong>Step 2 — Show a "New Password" input to the user.</strong><br><br>
<strong>Step 3 — On form submit, call this endpoint</strong> with the token and new password.<br><br>
Reset tokens are <strong>single-use and time-limited</strong> — once used or expired, this endpoint returns 400. On success, redirect the user to the login page. The new password must satisfy the same strength requirements as signup.`,
        exampleCode: `// On your reset-password page, extract the token from the URL on load:
const resetToken = new URLSearchParams(window.location.search).get('token');

if (!resetToken) {
  alert('Invalid or missing reset token.');
}

// On form submit:
document.querySelector('#resetForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const newPassword = document.querySelector('#newPassword').value;

  const res = await fetch('${base}/auth/update-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: resetToken, newPassword })
  });

  const data = await res.json();

  if (res.ok) {
    alert('Password updated! Please log in.');
    window.location.href = '/login';
  } else {
    alert('Error: ' + (data.message || 'Invalid or expired token.'));
  }
});`,
      },

      {
        method: 'GET', path: '/auth/verify-email',
        title: 'Verify Email Address',
        description: 'Confirms a user\'s email via the token sent at signup. This link is clicked directly from the email — you don\'t call it in code.',
        auth: false, admin: false,
        payloadLabel: 'Query Parameters (no request body)',
        payload: `// This is a GET endpoint — no request body.
// The user clicks this link directly from their inbox.

// Query Parameters:
// token       (required) — the verification token (Auth-Pro adds it to the email link automatically)
// redirectUrl (optional) — your frontend page to redirect to after successful verification

// Example link in the email:
// ${base}/auth/verify-email?token=TOKEN&redirectUrl=https://yourapp.com/dashboard

// If redirectUrl is provided  → redirects the user to that URL
// If redirectUrl is omitted   → returns JSON: { "message": "Email successfully verified." }
// If token is invalid/expired → returns 400`,
        howToUse: `<strong>You don't call this endpoint in your code.</strong> It is the destination of the email verification link that Auth-Pro automatically sends when a user signs up.<br><br>
The full flow:<br>
1. User signs up via <code>POST /auth/signup</code> — you pass a <code>redirectUrl</code> in the body<br>
2. Auth-Pro sends the user a verification email with a link pointing to this endpoint<br>
3. User clicks the link — Auth-Pro marks their email as verified (<code>isEmailVerified = true</code>)<br>
4. Auth-Pro redirects the user to your <code>redirectUrl</code> (e.g. your dashboard)<br><br>
To control where the user lands after verification, set the <code>redirectUrl</code> field correctly during signup. Make sure it points to a real page in your app.`,
        exampleCode: `// You don't call this endpoint directly.
// Just make sure you pass the correct redirectUrl during signup:

fetch('${base}/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'MyP@ssword1',
    // After the user clicks the verification email, they land here:
    redirectUrl: 'https://yourapp.com/dashboard',
    metadata: { name: 'Alice' }
  })
});

// The verification email link will look like:
// ${base}/auth/verify-email?token=TOKEN&redirectUrl=https://yourapp.com/dashboard`,
      },

      {
        method: 'GET', path: '/auth/reset-password',
        title: 'Password Reset Redirect',
        description: 'Validates the reset link from the email and redirects the user to your frontend with the token appended to the URL.',
        auth: false, admin: false,
        payloadLabel: 'Query Parameters (no request body)',
        payload: `// This is a GET redirect endpoint — no request body.
// The user clicks this link directly from their inbox.

// Query Parameters:
// token       (required) — the reset token (Auth-Pro adds it automatically)
// redirectUrl (optional) — your frontend reset-password page

// Example link in the email:
// ${base}/auth/reset-password?token=TOKEN&redirectUrl=https://yourapp.com/reset-password

// What happens:
// Auth-Pro redirects the user to:
//   https://yourapp.com/reset-password?token=TOKEN
// Your page then reads that token and calls POST /auth/update-password`,
        howToUse: `<strong>You don't call this endpoint in your code.</strong> It is the link inside the forgot-password email. When the user clicks it, Auth-Pro appends the token to your <code>redirectUrl</code> and redirects the browser.<br><br>
Example: if your <code>redirectUrl</code> is <code>https://yourapp.com/reset-password</code>, the user lands on:<br>
<code>https://yourapp.com/reset-password?token=abc123xyz</code><br><br>
Your page then extracts the token from the URL and calls <code>POST /auth/update-password</code>.<br><br>
If no <code>redirectUrl</code> is given, the endpoint returns JSON with the token instead of redirecting. Always set the redirectUrl in your forgot-password call.`,
        exampleCode: `// You don't call this endpoint directly.
// Set up the flow correctly in your forgot-password call:

fetch('${base}/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    // The user clicks the email link and lands on this page with ?token=TOKEN appended:
    redirectUrl: 'https://yourapp.com/reset-password'
  })
});

// Then on your /reset-password page:
const token = new URLSearchParams(window.location.search).get('token');
// Pass this token to POST /auth/update-password (see that endpoint's example)`,
      },

      {
        method: 'GET', path: '/users/me',
        title: 'Get Current User Profile',
        description: 'Returns the full profile of the authenticated user including id, email, avatarUrl, metadata, and verification status.',
        auth: true, admin: false,
        payloadLabel: 'Required Header (no request body)',
        payload: `// No request body.
// Required Header:
// Authorization: Bearer YOUR_JWT_TOKEN

// Response shape:
{
  "id": "clx9ab12cd34ef56",
  "email": "user@example.com",
  "avatarUrl": "https://cdn.example.com/avatars/abc.webp", // null if not set
  "metadata": {                                              // null if not set
    "name": "John Doe",
    "plan": "pro"
  },
  "isEmailVerified": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-06-01T12:00:00.000Z"
  // "password" is NEVER returned
}`,
        howToUse: `Call this on any page that needs user data — your dashboard, settings page, profile page, etc.<br><br>
Attach the JWT from login/signup in the <code>Authorization</code> header as a Bearer token.<br><br>
The response includes:<br>
• <strong>id</strong> — unique user ID (needed for admin operations like ban)<br>
• <strong>email</strong> — the user's email address<br>
• <strong>avatarUrl</strong> — cloud CDN URL of their profile picture (<code>null</code> if no avatar set)<br>
• <strong>metadata</strong> — any custom JSON you stored (<code>null</code> if nothing stored yet)<br>
• <strong>isEmailVerified</strong> — whether the user has clicked their verification email link<br>
• <strong>createdAt / updatedAt</strong> — account timestamps<br><br>
The <code>password</code> field is <strong>never</strong> returned. Returns <strong>401</strong> if the token is missing, invalid, or expired.`,
        exampleCode: `const token = localStorage.getItem('token');

fetch('${base}/users/me', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${token}\`
  }
})
.then(res => {
  if (res.status === 401) throw new Error('Not authenticated');
  return res.json();
})
.then(user => {
  console.log('ID:', user.id);
  console.log('Email:', user.email);
  console.log('Email verified:', user.isEmailVerified);
  console.log('Avatar:', user.avatarUrl ?? 'No avatar set');
  console.log('Custom data:', user.metadata);

  // Example: show avatar in your UI
  if (user.avatarUrl) {
    document.querySelector('#avatar').src = user.avatarUrl;
  }
})
.catch(err => console.error(err.message));`,
      },

      {
        method: 'PATCH', path: '/users/me',
        title: 'Update User Metadata',
        description: 'Deep-merges custom metadata into the user\'s profile. Only keys you send are updated — all existing metadata is preserved.',
        auth: true, admin: false,
        payloadLabel: 'Request Body (JSON)',
        payload: `// Required Header:
// Authorization: Bearer YOUR_JWT_TOKEN

// Request Body:
{
  "metadata": {              // optional key — any JSON object
    "displayName": "Alice",  // add or update any field
    "theme": "dark",
    "newsletterOptIn": true,
    "address": "123 Main St",
    "onboardingStep": 3,
    "customRole": "editor"
  }
}

// IMPORTANT: This is a MERGE, not a replace.
// Keys not included in your payload are preserved as-is.
// To delete a key, send it as null: { "metadata": { "oldKey": null } }`,
        howToUse: `Use this to save any custom user-level data — UI preferences, settings, onboarding state, plan details, etc.<br><br>
<strong>Merge behaviour:</strong> The server deep-merges your payload into existing metadata. If the user already has <code>metadata.theme = "light"</code> and you send <code>{ "metadata": { "theme": "dark" } }</code>, only <code>theme</code> changes. All other metadata keys are untouched.<br><br>
<strong>Deleting a key:</strong> Send the key with a <code>null</code> value to remove it:<br>
<code>{ "metadata": { "keyToRemove": null } }</code><br><br>
You can store nested objects inside metadata. Returns the full updated user object on success. Requires a valid JWT in the Authorization header. Returns 401 if unauthenticated.`,
        exampleCode: `const token = localStorage.getItem('token');

// Example: User changed their theme preference
fetch('${base}/users/me', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`
  },
  body: JSON.stringify({
    metadata: {
      theme: 'dark',
      displayName: 'Alice',
      onboardingComplete: true
      // Other existing metadata fields (e.g. phone, plan) are preserved
    }
  })
})
.then(res => res.json())
.then(user => {
  console.log('Updated metadata:', user.metadata);
  console.log('Theme is now:', user.metadata.theme);
});`,
      },

      {
        method: 'POST', path: '/users/avatar',
        title: 'Upload Profile Picture',
        description: 'Uploads a profile image for the authenticated user. Automatically compressed to WebP and stored in cloud storage.',
        auth: true, admin: false,
        payloadLabel: 'Multipart Form Data',
        payload: `// Required Header:
// Authorization: Bearer YOUR_JWT_TOKEN
// Content-Type: multipart/form-data  ← set AUTOMATICALLY by the browser/fetch, do NOT set it manually

// Form Fields:
// file — (required) the image file (JPG, PNG, WebP, GIF, etc.)

// Response: full UserEntity with updated avatarUrl field
// { "avatarUrl": "https://cdn.example.com/avatars/uuid.webp", ...rest of user }

// Note: Do NOT manually set Content-Type when using FormData.
// The browser sets it automatically with the correct multipart boundary.
// Setting it manually will break the upload.`,
        howToUse: `Use an HTML <code>&lt;input type="file" accept="image/*"&gt;</code> element to let the user pick an image. Build a <code>FormData</code> object and append the file under the key <code>"file"</code>.<br><br>
<strong>Critical:</strong> Do NOT set <code>Content-Type</code> manually in the headers. The browser adds it automatically with the correct multipart boundary string. If you set it manually, the server cannot parse the file.<br><br>
The image is automatically compressed and converted to <strong>WebP format</strong> before being saved to cloud storage. After a successful upload, the response contains the updated user object with the new <code>avatarUrl</code>.<br><br>
Use <code>user.avatarUrl</code> as the <code>src</code> of an <code>&lt;img&gt;</code> tag to display the avatar in your UI.`,
        exampleCode: `const token = localStorage.getItem('token');
const fileInput = document.querySelector('#avatarInput');

fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file); // field name MUST be exactly "file"

  const res = await fetch('${base}/users/avatar', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${token}\`
      // DO NOT add Content-Type here — FormData sets it automatically!
    },
    body: formData
  });

  const user = await res.json();
  console.log('New avatar URL:', user.avatarUrl);

  // Update the avatar image in your UI:
  document.querySelector('#avatarImg').src = user.avatarUrl;
});`,
      },

      {
        method: 'POST', path: '/users/ban',
        title: 'Ban User (Admin)',
        description: 'Permanently bans a user account by their ID. Requires the server-side admin password. No JWT needed.',
        auth: false, admin: true,
        payloadLabel: 'Request Body (JSON)',
        payload: `{
  "adminPass": "your-admin-password",  // required — must match the ADMIN_PASS env variable on the server
  "userId": "clx9ab12cd34ef56gh78"     // required — the unique ID of the user to ban
                                       //   (get it from GET /users/me or your database)
}

// Response: the updated UserEntity with isEmailVerified set to false (ban mechanism)
// Returns 401 if adminPass is wrong
// Returns 404 if userId does not exist`,
        howToUse: `Admin-only endpoint — <strong>no JWT required</strong>. Authentication is done via the <code>adminPass</code> field, which must match the <code>ADMIN_PASS</code> environment variable set on the server.<br><br>
To get a user's <code>userId</code>, either call <code>GET /users/me</code> while authenticated as that user, or look it up directly in your database.<br><br>
Banning works by setting <code>isEmailVerified = false</code>, which prevents the user from logging in.<br><br>
Returns <strong>401</strong> if the admin password doesn't match, and <strong>404</strong> if the user ID doesn't exist.<br><br>
<strong>Security:</strong> Never expose this endpoint or the <code>adminPass</code> in a public frontend. Only call it from a secure server-side admin panel or CLI tool.`,
        exampleCode: `// Admin-only action — run from a secure server-side context, NEVER from a public frontend!

fetch('${base}/users/ban', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adminPass: 'your-admin-password', // from ADMIN_PASS env var — keep this secret!
    userId: 'clx9ab12cd34ef56gh78'    // the ID of the user to ban
  })
})
.then(res => res.json())
.then(data => {
  if (data.statusCode === 401) {
    console.error('Wrong admin password!');
  } else if (data.statusCode === 404) {
    console.error('User not found!');
  } else {
    console.log('User banned successfully:', data.id);
    console.log('isEmailVerified is now:', data.isEmailVerified); // false
  }
});`,
      },

      {
        method: 'POST', path: '/mail/send-custom',
        title: 'Send Custom Email (Admin)',
        description: 'Sends a fully custom HTML email to any address on behalf of your application. Requires the admin password.',
        auth: false, admin: true,
        payloadLabel: 'Request Body (JSON)',
        payload: `{
  "adminPass": "your-admin-password",           // required — must match ADMIN_PASS env variable
  "to": "recipient@example.com",                // required — the recipient's email address
  "subject": "Welcome to Our Platform!",        // required — the email subject line
  "htmlTemplate": "<h1>Hello!</h1><p>...</p>"   // required — full HTML body of the email
                                                //   Use inline CSS for best email client compatibility
}

// Response on success:
// { "message": "Email successfully sent." }`,
        howToUse: `Admin-only endpoint — no JWT required. Authentication uses <code>adminPass</code> matched against the <code>ADMIN_PASS</code> env variable.<br><br>
The <code>htmlTemplate</code> field accepts complete HTML. Tips for best email client compatibility:<br>
• Use <strong>inline CSS</strong> (<code>style="..."</code> attributes) — most email clients strip external <code>&lt;style&gt;</code> tags<br>
• Use table-based layouts for complex designs<br>
• Keep image src URLs absolute (full URL, not relative paths)<br><br>
<strong>Use cases:</strong> Onboarding emails, product announcements, custom transactional notifications, one-off emails to specific users.<br><br>
Returns <code>{ "message": "Email successfully sent." }</code> on success. Returns 401 if the admin password is wrong.`,
        exampleCode: `// Admin-only — call from a secure server-side context

fetch('${base}/mail/send-custom', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adminPass: 'your-admin-password',
    to: 'newuser@example.com',
    subject: 'Welcome to Our Platform!',
    htmlTemplate: \`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #3b82f6;">Welcome aboard!</h1>
        <p style="color: #374151;">Your account is ready. Here are your next steps:</p>
        <ul style="color: #374151;">
          <li>Complete your profile</li>
          <li>Explore the dashboard</li>
        </ul>
        <a href="https://yourapp.com/dashboard"
           style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 24px;
                  text-decoration:none;border-radius:6px;margin-top:16px;">
          Go to Dashboard
        </a>
      </div>
    \`
  })
})
.then(res => res.json())
.then(data => console.log(data.message)); // "Email successfully sent."`,
      },

      {
        method: 'POST', path: '/media/images',
        title: 'Upload Image to Media Library',
        description: 'Uploads and compresses an image into the user\'s personal media library with a required tag for categorization.',
        auth: true, admin: false,
        payloadLabel: 'Multipart Form Data',
        payload: `// Required Header:
// Authorization: Bearer YOUR_JWT_TOKEN
// Content-Type: multipart/form-data  ← set automatically, do NOT set manually

// Form Fields:
// file — (required) the image file (JPG, PNG, WebP, GIF, etc.)
// tag  — (required) a string label to categorize this image
//         e.g. "blog-thumbnails", "project-alpha", "product-shots", "gallery"

// Response (MediaEntity):
{
  "id": "clx9ab12cd34ef56",
  "url": "https://cdn.example.com/media/images/uuid.webp",
  "tag": "blog-thumbnails",
  "mimeType": "image/webp",
  "size": 45312,            // size in bytes after WebP compression
  "filename": "media/images/uuid.webp",
  "createdAt": "2025-06-01T00:00:00.000Z"
}`,
        howToUse: `This is different from <code>POST /users/avatar</code> — that endpoint sets a single profile picture. This endpoint builds a <strong>full media library</strong> with multiple organized files per user.<br><br>
The <code>tag</code> field is required and is how you group and retrieve images later. For example:<br>
• <code>"blog-thumbnails"</code> for article cover images<br>
• <code>"project-alpha"</code> for project-specific assets<br>
• <code>"gallery"</code> for user-uploaded photos<br><br>
Retrieve all files with a specific tag using <code>GET /media?tag=your-tag</code>.<br><br>
The image is compressed to <strong>WebP</strong> automatically. The response <code>MediaEntity</code> includes the public CDN <code>url</code> and the file's <code>id</code> — save the <code>id</code> if you need to delete it later.`,
        exampleCode: `const token = localStorage.getItem('token');

async function uploadToMediaLibrary(file, tag) {
  const formData = new FormData();
  formData.append('file', file); // field name must be "file"
  formData.append('tag', tag);   // required — categorization label

  const res = await fetch('${base}/media/images', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${token}\`
      // NO Content-Type — FormData sets it automatically
    },
    body: formData
  });

  if (!res.ok) throw new Error('Upload failed: ' + res.status);

  const media = await res.json();
  console.log('Uploaded URL:', media.url);
  console.log('Media ID:', media.id);   // save this to delete later
  console.log('Tag:', media.tag);
  console.log('Size after compression:', media.size, 'bytes');

  return media;
}

// Usage:
const fileInput = document.querySelector('#imageInput');
fileInput.addEventListener('change', () => {
  uploadToMediaLibrary(fileInput.files[0], 'blog-thumbnails');
});`,
      },

      {
        method: 'GET', path: '/media',
        title: 'List User Media',
        description: 'Returns all media files uploaded by the authenticated user. Optionally filter by tag.',
        auth: true, admin: false,
        payloadLabel: 'Query Parameters (no request body)',
        payload: `// Required Header:
// Authorization: Bearer YOUR_JWT_TOKEN

// Optional Query Parameter:
// ?tag=your-tag  — filter results to only files with this exact tag

// Examples:
// GET /media                          → all media files for the user (no filter)
// GET /media?tag=blog-thumbnails      → only files tagged "blog-thumbnails"
// GET /media?tag=project-alpha        → only files tagged "project-alpha"

// Response: array of MediaEntity objects
// Returns [] (empty array) if no files found — not a 404`,
        howToUse: `Call this to list all images the user has uploaded. Returns an array of <code>MediaEntity</code> objects.<br><br>
Use the optional <code>?tag=</code> query parameter to filter results by category. This is the primary way to retrieve specific groups of images (e.g. all thumbnails for a blog post, all assets for a project).<br><br>
Each item in the response includes:<br>
• <strong>id</strong> — use this to fetch a specific file (<code>GET /media/:id</code>) or delete it (<code>DELETE /media/:id</code>)<br>
• <strong>url</strong> — the public CDN URL to display the image directly in an <code>&lt;img&gt;</code> tag<br>
• <strong>tag</strong> — the category label you assigned at upload<br>
• <strong>size</strong> — file size in bytes after compression<br>
• <strong>createdAt</strong> — upload timestamp<br><br>
Returns an empty array <code>[]</code> if no files exist for the tag — not a 404. Returns 401 if unauthenticated.`,
        exampleCode: `const token = localStorage.getItem('token');

// Fetch ALL media for the user:
async function getAllMedia() {
  const res = await fetch('${base}/media', {
    headers: { 'Authorization': \`Bearer \${token}\` }
  });
  return res.json(); // MediaEntity[]
}

// Fetch media filtered by tag:
async function getMediaByTag(tag) {
  const url = \`${base}/media?tag=\${encodeURIComponent(tag)}\`;
  const res = await fetch(url, {
    headers: { 'Authorization': \`Bearer \${token}\` }
  });
  return res.json(); // MediaEntity[]
}

// Example: render a gallery of blog thumbnails
getMediaByTag('blog-thumbnails').then(images => {
  const gallery = document.querySelector('#gallery');
  gallery.innerHTML = '';

  images.forEach(img => {
    const el = document.createElement('img');
    el.src = img.url;
    el.alt = img.tag;
    el.dataset.mediaId = img.id; // save for potential deletion
    gallery.appendChild(el);
  });

  console.log(\`Loaded \${images.length} images\`);
});`,
      },

      {
        method: 'GET', path: '/media/:id',
        title: 'Get Single Media File',
        description: 'Returns the full details of a specific media file by its unique ID.',
        auth: true, admin: false,
        payloadLabel: 'Path Parameter (no request body)',
        payload: `// Required Header:
// Authorization: Bearer YOUR_JWT_TOKEN

// Path Parameter:
// :id — the unique media file ID (obtained when uploading or from GET /media)

// Example:
// GET /media/clx9ab12cd34ef56gh78

// Response (MediaEntity):
{
  "id": "clx9ab12cd34ef56gh78",
  "userId": "clxuser123",
  "email": "user@example.com",
  "url": "https://cdn.example.com/media/images/uuid.webp",
  "type": "image",
  "filename": "media/images/uuid.webp",
  "mimeType": "image/webp",
  "size": 45312,
  "tag": "blog-thumbnails",
  "createdAt": "2025-06-01T00:00:00.000Z",
  "updatedAt": "2025-06-01T00:00:00.000Z"
}`,
        howToUse: `Use this to retrieve the complete details of a single uploaded file by its <code>id</code>.<br><br>
The <code>id</code> is returned when you upload an image (<code>POST /media/images</code>) and is included in every item from <code>GET /media</code>. Save the <code>id</code> when uploading if you need to reference individual files later.<br><br>
The response includes all fields of the <code>MediaEntity</code>: the CDN <code>url</code>, <code>tag</code>, <code>mimeType</code>, <code>size</code>, <code>filename</code>, and timestamps.<br><br>
<strong>Access control:</strong> Only returns files owned by the currently authenticated user. If the ID belongs to another user's file, the server returns 404 (not 403 — to prevent ID enumeration).`,
        exampleCode: `const token = localStorage.getItem('token');
const mediaId = 'clx9ab12cd34ef56gh78'; // from upload response or GET /media list

fetch(\`${base}/media/\${mediaId}\`, {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${token}\`
  }
})
.then(res => {
  if (res.status === 404) throw new Error('File not found or access denied');
  if (!res.ok) throw new Error('Request failed: ' + res.status);
  return res.json();
})
.then(media => {
  console.log('File URL:', media.url);
  console.log('Tag:', media.tag);
  console.log('Size:', media.size, 'bytes');
  console.log('Type:', media.mimeType);
  console.log('Uploaded at:', media.createdAt);

  // Display the image:
  document.querySelector('#previewImg').src = media.url;
})
.catch(err => console.error(err.message));`,
      },

      {
        method: 'DELETE', path: '/media/:id',
        title: 'Delete Media File',
        description: 'Permanently deletes a media file from both the database and cloud storage. This action cannot be undone.',
        auth: true, admin: false,
        payloadLabel: 'Path Parameter (no request body)',
        payload: `// Required Header:
// Authorization: Bearer YOUR_JWT_TOKEN

// Path Parameter:
// :id — the unique media file ID to delete

// Example:
// DELETE /media/clx9ab12cd34ef56gh78

// Response on success:
// { "message": "Media successfully deleted" }

// After deletion:
// - The file's URL will return a 404 from cloud storage
// - The file will no longer appear in GET /media
// - This action is PERMANENT and cannot be undone`,
        howToUse: `Permanently deletes the media file — both the <strong>database record</strong> and the <strong>file in cloud storage</strong>. This is irreversible.<br><br>
Only the <strong>owner</strong> of the file can delete it. Attempting to delete another user's file returns 404 (not 403 — to prevent ID enumeration).<br><br>
After deletion:<br>
• The file's CDN URL will return a 404 if fetched<br>
• The file no longer appears in <code>GET /media</code> results<br>
• Any references to the URL in your database or UI should be cleaned up<br><br>
<strong>Best practice:</strong> Always confirm with the user before calling delete (e.g. a "Are you sure?" dialog). The action is permanent. Returns 401 if unauthenticated.`,
        exampleCode: `const token = localStorage.getItem('token');

async function deleteMedia(mediaId) {
  // Always confirm before deleting — it's permanent!
  const confirmed = confirm('Delete this file? This cannot be undone.');
  if (!confirmed) return;

  const res = await fetch(\`${base}/media/\${mediaId}\`, {
    method: 'DELETE',
    headers: {
      'Authorization': \`Bearer \${token}\`
    }
  });

  const data = await res.json();

  if (res.ok) {
    console.log(data.message); // "Media successfully deleted"

    // Remove the element from your UI:
    document.querySelector(\`[data-media-id="\${mediaId}"]\`)?.remove();
  } else if (res.status === 404) {
    console.error('File not found or access denied');
  } else {
    console.error('Delete failed:', data);
  }
}

// Attach to a delete button:
document.querySelectorAll('.delete-media-btn').forEach(btn => {
  btn.addEventListener('click', () => deleteMedia(btn.dataset.mediaId));
});`,
      },
    ];

    const methodBadge: Record<string, string> = {
      POST:   'text-green-300 bg-green-500/20 border-green-500/40',
      GET:    'text-sky-300 bg-sky-500/20 border-sky-500/40',
      PATCH:  'text-orange-300 bg-orange-500/20 border-orange-500/40',
      DELETE: 'text-red-300 bg-red-500/20 border-red-500/40',
    };
    const borderLeft: Record<string, string> = {
      POST:   'border-l-green-500',
      GET:    'border-l-sky-500',
      PATCH:  'border-l-orange-500',
      DELETE: 'border-l-red-500',
    };

    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const htmlContent = endpoints.map(ep => `
                  <div class="glass rounded-xl border-l-4 ${borderLeft[ep.method] ?? 'border-l-slate-500'} mb-8 hover:bg-slate-800/50 transition overflow-hidden">

                    <!-- 1. Endpoint -->
                    <div class="p-5 flex flex-wrap items-center gap-3 border-b border-white/5">
                      <span class="${methodBadge[ep.method] ?? 'text-slate-300 bg-slate-500/20 border-slate-500/40'} border px-3 py-1 rounded-lg font-mono font-bold text-sm shrink-0">${ep.method}</span>
                      <code class="text-slate-100 font-mono font-bold text-base flex-grow">${ep.path}</code>
                      ${ep.auth ? '<span class="text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 text-xs px-2.5 py-1 rounded-full font-semibold shrink-0">🔒 Auth Required</span>' : ''}
                      ${ep.admin ? '<span class="text-red-300 bg-red-500/10 border border-red-500/20 text-xs px-2.5 py-1 rounded-full font-semibold shrink-0">🛡 Admin Only</span>' : ''}
                    </div>

                    <!-- 2. Title + Description -->
                    <div class="px-6 pt-5 pb-4 border-b border-white/5">
                      <h2 class="text-xl font-bold text-sky-300 mb-2">${ep.title}</h2>
                      <p class="text-slate-300 text-sm leading-relaxed">${ep.description}</p>
                    </div>

                    <!-- 3+4. Payload + How to Use -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 border-b border-white/5">
                      <div class="p-6 border-r border-white/5">
                        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">${ep.payloadLabel}</h4>
                        <pre class="bg-slate-950/70 rounded-xl p-4 font-mono text-xs text-amber-300 border border-white/5 overflow-x-auto whitespace-pre-wrap leading-relaxed">${esc(ep.payload)}</pre>
                      </div>
                      <div class="p-6">
                        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">How to Use</h4>
                        <div class="text-sm text-slate-300 bg-slate-950/40 p-4 rounded-xl border border-white/5 leading-relaxed">${ep.howToUse}</div>
                      </div>
                    </div>

                    <!-- 5+6. Example Code -->
                    <div class="p-6">
                      <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Example Code (JavaScript / Fetch)</h4>
                      <div class="bg-[#0d1117] rounded-xl p-5 font-mono text-xs text-blue-300 border border-white/5 overflow-x-auto whitespace-pre-wrap leading-relaxed"><code>${esc(ep.exampleCode)}</code></div>
                    </div>

                  </div>`).join('\n');

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Auth-Pro API Documentation</title>
          <link rel="icon" href="/favicon.ico">
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
          <style>
              body { font-family: 'Inter', sans-serif; background-color: #020617; color: #f8fafc; }
              code, pre { font-family: 'Fira Code', monospace; }
              .glass { background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.05); }
              .text-gradient { background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
              #promptModal { display: none; }
              #promptModal.active { display: flex; animation: fadeIn 0.3s ease-out; }
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              .modal-content { animation: slideIn 0.3s ease-out; }
              @keyframes slideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
              .flashy-btn {
                  position: relative;
                  background: linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6);
                  background-size: 200% auto;
                  color: white;
                  animation: shine 3s linear infinite;
                  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
              }
              .flashy-btn:hover { box-shadow: 0 0 30px rgba(139, 92, 246, 0.8); }
              @keyframes shine { to { background-position: 200% center; } }
          </style>
      </head>
      <body class="min-h-screen flex flex-col relative overflow-x-hidden">
          <div class="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900 rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
          <div class="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900 rounded-full blur-[150px] opacity-20 pointer-events-none"></div>

          <nav class="w-full glass z-20 px-8 py-4 flex justify-between items-center sticky top-0 border-b border-white/5">
              <a href="/" class="flex items-center gap-3 group">
                  <img src="/icon.png" alt="Auth-Pro Icon" class="w-10 h-10 rounded-lg shadow-lg shadow-sky-500/20 group-hover:scale-105 transition">
                  <span class="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 text-gradient">Auth-Pro</span>
              </a>
              <button onclick="document.getElementById('promptModal').classList.add('active')" class="flashy-btn px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 flex items-center gap-2 text-sm">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Copy AI Prompt
              </button>
          </nav>

          <main class="flex-grow max-w-7xl w-full mx-auto p-4 md:p-8 z-10 pb-24">
              <div class="text-center mb-16 mt-8">
                  <span class="bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-sm font-semibold border border-blue-500/20 tracking-wide uppercase">15 Endpoints · Beginner Friendly</span>
                  <h1 class="text-5xl font-extrabold mb-6 mt-6 tracking-tight">API <span class="bg-gradient-to-r from-sky-400 to-indigo-400 text-gradient">Documentation</span></h1>
                  <p class="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">Complete reference for all Auth-Pro endpoints. Each entry includes the exact payload, a detailed usage guide, and a ready-to-paste JavaScript example.</p>
              </div>

              <!-- Endpoint Group Labels -->
              <div class="flex flex-wrap gap-3 mb-10 justify-center">
                <span class="bg-slate-800/60 border border-white/10 text-slate-300 text-xs font-semibold px-4 py-2 rounded-full">🔐 Auth (6)</span>
                <span class="bg-slate-800/60 border border-white/10 text-slate-300 text-xs font-semibold px-4 py-2 rounded-full">👤 Users (4)</span>
                <span class="bg-slate-800/60 border border-white/10 text-slate-300 text-xs font-semibold px-4 py-2 rounded-full">📧 Mail (1)</span>
                <span class="bg-slate-800/60 border border-white/10 text-slate-300 text-xs font-semibold px-4 py-2 rounded-full">🖼 Media (4)</span>
              </div>

              <div class="space-y-2">
${htmlContent}
              </div>
          </main>

          <!-- AI Prompt Modal -->
          <div id="promptModal" class="fixed inset-0 z-50 items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
              <div class="modal-content glass max-w-3xl w-full rounded-2xl shadow-2xl flex flex-col max-h-[90vh] border border-white/10">
                  <div class="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                      <h3 class="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 text-gradient">AI Implementation Prompt</h3>
                      <button onclick="document.getElementById('promptModal').classList.remove('active')" class="text-slate-400 hover:text-white transition bg-white/5 hover:bg-white/10 p-2 rounded-lg">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                  </div>
                  <div class="p-6 overflow-y-auto flex-grow bg-slate-950/50">
                      <p class="text-sm text-slate-300 mb-4 font-medium">Paste this into Claude, ChatGPT, or any AI to instantly generate your frontend auth integration!</p>
                      <div class="relative group">
                          <textarea id="promptText" readonly class="w-full h-72 bg-[#0a0f1c] text-green-400 font-mono text-sm p-5 rounded-xl border border-slate-700/50 focus:outline-none focus:border-purple-500/50 resize-none shadow-inner">${aiPrompt}</textarea>
                      </div>
                  </div>
                  <div class="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                      <button onclick="document.getElementById('promptModal').classList.remove('active')" class="px-6 py-2.5 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition font-medium">Close</button>
                      <button onclick="copyPrompt()" id="copyBtn" class="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition flex items-center gap-2 shadow-lg shadow-purple-500/20">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                          Copy Prompt
                      </button>
                  </div>
              </div>
          </div>

          <script>
              function copyPrompt() {
                  const promptText = document.getElementById('promptText');
                  promptText.select();
                  document.execCommand('copy');
                  const btn = document.getElementById('copyBtn');
                  const originalHtml = btn.innerHTML;
                  btn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Copied!';
                  btn.classList.add('bg-green-500', 'shadow-green-500/20');
                  btn.classList.remove('bg-purple-600', 'shadow-purple-500/20');
                  setTimeout(() => {
                      btn.innerHTML = originalHtml;
                      btn.classList.remove('bg-green-500', 'shadow-green-500/20');
                      btn.classList.add('bg-purple-600', 'shadow-purple-500/20');
                  }, 2000);
              }
          </script>
      </body>
      </html>
    `;
    res.type('text/html').send(html);
  }
}
