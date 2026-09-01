import { Controller, Get, Res } from '@nestjs/common';
import { join } from 'path';
import type { Response } from 'express';
import { getAllEnvResults, getEnvSummary, ENV_GROUPS, EnvVarResult, EnvGroupDoc } from './config/env-guide';

@Controller()
export class AppController {
  private esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private sharedStyles(): string {
    return `
              body { font-family: 'Inter', sans-serif; background-color: #030712; color: #f1f5f9; }
              .glass { background: linear-gradient(155deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)); backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%); border: 1px solid rgba(255,255,255,0.09); box-shadow: 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07); }
              .glass-nav { background: rgba(5,8,20,0.55); backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%); border-bottom: 1px solid rgba(255,255,255,0.08); }
              .text-gradient { background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
              @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
              .float { animation: float 4s ease-in-out infinite; }
              @keyframes drift { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(3%,4%) scale(1.08)} }
              .drift { animation: drift 22s ease-in-out infinite; }
              .drift-slow { animation: drift 30s ease-in-out infinite reverse; }
              .glow { box-shadow: 0 0 50px rgba(34,211,238,0.35); }`;
  }

  private renderBlobs(): string {
    return `
          <div class="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500 rounded-full blur-[130px] opacity-20 pointer-events-none drift"></div>
          <div class="fixed top-[20%] right-[-15%] w-[35%] h-[35%] bg-fuchsia-500 rounded-full blur-[130px] opacity-15 pointer-events-none drift-slow"></div>
          <div class="fixed bottom-[10%] left-[-10%] w-[35%] h-[35%] bg-emerald-500 rounded-full blur-[130px] opacity-10 pointer-events-none drift"></div>
          <div class="fixed bottom-[-15%] right-[-10%] w-[40%] h-[40%] bg-violet-500 rounded-full blur-[130px] opacity-15 pointer-events-none drift-slow"></div>`;
  }

  private renderNav(active: 'home' | 'docs', extraButtonHtml = ''): string {
    const linkClasses = (isActive: boolean) =>
      isActive
        ? 'bg-white/10 text-white border border-white/10'
        : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent';
    const swaggerLink =
      process.env.PRODUCTION !== 'true'
        ? `<a href="/api" class="hidden md:inline-block px-4 py-2 rounded-full font-medium text-sm transition ${linkClasses(false)}">Swagger</a>`
        : '';

    return `
          <nav class="w-full glass-nav z-20 px-4 sm:px-8 py-4 flex justify-between items-center sticky top-0">
              <a href="/" class="flex items-center gap-3 group shrink-0">
                  <img src="/icon.png" alt="Auth-Pro" class="w-10 h-10 rounded-lg shadow-lg shadow-sky-500/20 float">
                  <span class="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 text-gradient">Auth-Pro</span>
              </a>
              <div class="flex items-center gap-1.5 sm:gap-2">
                  <a href="/" class="hidden sm:inline-block whitespace-nowrap px-3 sm:px-4 py-2 rounded-full font-medium text-sm transition ${linkClasses(active === 'home')}">Setup Dashboard</a>
                  <a href="/docs" class="whitespace-nowrap px-2.5 sm:px-4 py-2 rounded-full font-medium text-sm transition ${linkClasses(active === 'docs')}">API Docs</a>
                  ${swaggerLink}
                  <a href="https://github.com/ABDULAAQILKHAN/AUTH-PRO" target="_blank"
                     class="px-3 sm:px-4 py-2 rounded-full border border-white/10 hover:border-white/25 hover:bg-white/5 transition text-slate-300 font-medium flex items-center gap-2 text-sm">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                      <span class="hidden sm:inline">GitHub</span>
                  </a>
                  ${extraButtonHtml}
              </div>
          </nav>`;
  }

  private renderEnvCard(v: EnvVarResult): string {
    const badge = {
      configured: { classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: '✅ Configured' },
      default: { classes: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20', label: '🟡 Using Default' },
      missing: { classes: 'bg-red-500/10 text-red-300 border-red-500/20', label: '⚠️ Missing' },
    }[v.status];

    const stepsHtml = v.steps.map((s) => `<li>${this.esc(s)}</li>`).join('\n            ');

    return `
        <div class="glass rounded-2xl overflow-hidden">
            <div class="p-5 flex flex-wrap items-start justify-between gap-4">
                <div class="flex-1 min-w-[220px]">
                    <div class="flex items-center gap-2 flex-wrap mb-1.5">
                        <code class="text-slate-100 font-mono font-bold text-sm">${v.key}</code>
                        <span class="${badge.classes} border px-2.5 py-0.5 rounded-full text-xs font-semibold">${badge.label}</span>
                        <span class="text-xs px-2.5 py-0.5 rounded-full border ${v.required ? 'border-sky-500/30 text-sky-400 bg-sky-500/5' : 'border-slate-600/50 text-slate-400'}">${v.required ? 'Required' : 'Optional'}</span>
                    </div>
                    <p class="text-slate-400 text-sm leading-relaxed">${this.esc(v.description)}</p>
                </div>
                <button onclick="document.getElementById('steps-${v.key}').classList.toggle('hidden')"
                        class="shrink-0 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-slate-200 transition">
                    Show Steps
                </button>
            </div>
            <div id="steps-${v.key}" class="hidden border-t border-white/10 bg-slate-950/40 p-5">
                <ol class="list-decimal list-inside space-y-1.5 text-sm text-slate-300 mb-4">
            ${stepsHtml}
                </ol>
                <div class="text-xs text-slate-500 uppercase tracking-widest mb-2">Add this to your .env</div>
                <pre class="bg-[#0a0f1c] text-green-400 font-mono text-xs p-3 rounded-lg border border-slate-700/50 overflow-x-auto">${this.esc(v.exampleLine)}</pre>
                ${v.hasCodeFallback ? `<p class="text-xs text-slate-500 mt-3">If left unset, defaults to: <code class="text-slate-400">${this.esc(v.defaultValue ?? '')}</code></p>` : ''}
            </div>
        </div>`;
  }

  private renderEnvGroup(group: EnvGroupDoc, results: EnvVarResult[]): string {
    const byKey = new Map(results.map((r) => [r.key, r]));
    const cardsHtml = group.vars
      .map((key) => byKey.get(key))
      .filter((v): v is EnvVarResult => Boolean(v))
      .map((v) => this.renderEnvCard(v))
      .join('\n');

    return `
        <section class="mb-12">
            <h2 class="text-xl font-bold mb-5 flex items-center gap-2"><span>${group.icon}</span> ${this.esc(group.title)}</h2>
            <div class="space-y-4">${cardsHtml}
            </div>
        </section>`;
  }

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
    const results = getAllEnvResults();
    const summary = getEnvSummary();
    const pct = summary.total > 0 ? Math.round((summary.configured / summary.total) * 100) : 0;
    const groupsHtml = ENV_GROUPS.map((g) => this.renderEnvGroup(g, results)).join('\n');

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Auth-Pro | Setup Dashboard</title>
          <meta name="description" content="Configure Auth-Pro: live status for every environment variable, plus step-by-step setup guides.">
          <link rel="icon" href="/favicon.ico">
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
          <style>${this.sharedStyles()}
          </style>
      </head>
      <body class="min-h-screen flex flex-col relative overflow-x-hidden">
          ${this.renderBlobs()}

          ${this.renderNav('home')}

          <main class="flex-grow max-w-5xl w-full mx-auto px-4 py-14 z-10">
              <div class="text-center mb-10">
                  <span class="glass inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-sky-300 tracking-wide uppercase">Setup Dashboard</span>
                  <h1 class="text-4xl md:text-5xl font-bold mt-6 mb-4 tracking-tight">Get <span class="bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 text-gradient">Auth-Pro</span> Running</h1>
                  <p class="text-slate-400 max-w-2xl mx-auto leading-relaxed">Auth-Pro boots fine even with an empty <code class="text-amber-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">.env</code>. Fill in the values below: each card shows its live status and exact setup steps.</p>
              </div>

              <div class="glass rounded-2xl p-6 mb-12">
                  <div class="flex justify-between items-center mb-3">
                      <span class="font-semibold text-slate-200">${summary.configured} of ${summary.total} environment variables configured</span>
                      <span class="text-sm text-slate-400">${pct}%</span>
                  </div>
                  <div class="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 rounded-full" style="width:${pct}%"></div>
                  </div>
                  ${
                    summary.missing > 0
                      ? `<p class="text-xs text-amber-400 mt-3">⚠️ ${summary.missing} required variable(s) still missing — related features won't work until they're set.</p>`
                      : `<p class="text-xs text-emerald-400 mt-3">✅ Everything required is configured.</p>`
                  }
              </div>

              ${groupsHtml}
          </main>

          <!-- Footer -->
          <footer class="glass z-10 border-t border-white/5 py-8 px-8 text-center text-slate-500 text-sm">
              <p class="mb-3 text-slate-400">
                  Built with ❤️ by <strong class="text-slate-200">Aaqil Khan</strong>
              </p>
              <div class="flex flex-wrap gap-5 justify-center">
                  <a href="/docs" class="hover:text-sky-400 transition">📘 API Docs</a>
                  <span class="text-slate-700">·</span>
                  <a href="https://solutions-with-aaqil.vercel.app/" target="_blank" class="hover:text-sky-400 transition">💼 B2B Solutions</a>
                  <span class="text-slate-700">·</span>
                  <a href="https://aaqilcodes.vercel.app/" target="_blank" class="hover:text-sky-400 transition">🌐 Personal Portfolio</a>
                  <span class="text-slate-700">·</span>
                  <a href="https://github.com/ABDULAAQILKHAN/AUTH-PRO" target="_blank" class="hover:text-sky-400 transition">⭐ GitHub</a>
              </div>
          </footer>
      </body>
      </html>
    `;
    res.type('text/html').send(html);
  }
  @Get('docs')
  getDocs(@Res() res: Response) {
    const base = process.env.API_URL || 'http://localhost:3000';

    const aiPrompt = `You are an expert AI coding assistant helping the user integrate Auth-Pro into their frontend application. Auth-Pro is a self-hosted backend providing JWT authentication, transactional email, and file/media storage — all 15 endpoints below are already live and working, so just wire up the frontend calls exactly as specified.

BASE URL: ${base}
All requests use JSON bodies unless noted as multipart/form-data.
Protected routes require the header:  Authorization: Bearer <accessToken>

AUTH ENDPOINTS

1. POST /auth/signup
   Body: { email, password, redirectUrl, metadata? }  → { accessToken }
   Notes: Logs the user in immediately (token is valid before email verification). Sends a
          verification email whose link hits GET /auth/verify-email, which then redirects
          the browser to your redirectUrl.

2. POST /auth/login
   Body: { email, password }  → { accessToken }
   Notes: Store the token and attach it to every protected request. Returns 401 for wrong
          credentials or a banned user.

3. POST /auth/forgot-password
   Body: { email, redirectUrl }  → { message }
   Notes: Always returns the same message, whether or not the email exists (prevents
          enumeration). Emails a link to GET /auth/reset-password, which redirects to YOUR
          redirectUrl with ?token=TOKEN appended.

4. POST /auth/update-password
   Body: { token, newPassword }  → { message }
   Notes: Call from your reset-password page after reading token from the URL. Tokens are
          single-use and expire — invalid/expired tokens return 400.

5. GET /auth/verify-email?token=TOKEN&redirectUrl=URL
   Notes: Not called from your code — this is the email link the user clicks. Marks the
          email verified, then redirects to redirectUrl (or returns JSON if omitted).

6. GET /auth/reset-password?token=TOKEN&redirectUrl=URL
   Notes: Not called from your code — this is the forgot-password email link. Appends the
          token to redirectUrl and redirects the browser there.

USER ENDPOINTS  (require Authorization: Bearer <token>)

7. GET /users/me
   Response: { id, email, avatarUrl, metadata, isEmailVerified, createdAt, updatedAt }
   Notes: password is never returned. 401 if the token is missing/invalid/expired.

8. PATCH /users/me
   Body: { metadata?: object }  → updated user object
   Notes: DEEP MERGE, not replace — only sent keys change. Delete a key by sending it as
          null: { metadata: { keyToRemove: null } }

9. POST /users/avatar   [multipart/form-data]
   Form fields: file (required)  → updated user object with new avatarUrl
   Notes: Do NOT set Content-Type manually — let FormData/fetch set it. Auto-compressed to
          WebP and stored in cloud storage.

10. POST /users/ban   [Admin — no JWT, uses adminPass instead]
    Body: { adminPass, userId }  → updated user object
    Notes: adminPass must equal the server's ADMIN_PASS env var. Get userId from
           GET /users/me or your database. Only call from a secure server-side context —
           never expose adminPass in a public frontend.

MAIL ENDPOINTS  (Admin — no JWT, uses adminPass instead)

11. POST /mail/send-custom
    Body: { adminPass, to, subject, htmlTemplate }  → { message }
    Notes: htmlTemplate is raw HTML — use inline CSS (style="...") since most email clients
           strip <style> tags, and absolute image URLs.

MEDIA ENDPOINTS  (require Authorization: Bearer <token>)

12. POST /media/images   [multipart/form-data]
    Form fields: file (required), tag (required — category label)
    Response: { id, url, tag, mimeType, size, filename, createdAt }
    Notes: Builds a per-user media library (unlike /users/avatar, which is one profile
           picture). Auto-compressed to WebP. Save id to delete later.

13. GET /media?tag=OPTIONAL_TAG
    Response: array of media objects (empty array if none — not 404)
    Notes: Omit ?tag to list everything, or filter to one category.

14. GET /media/:id
    Response: single media object
    Notes: Only returns files owned by the authenticated user — another user's file ID
           returns 404, not 403, to avoid ID enumeration.

15. DELETE /media/:id
    Response: { message }
    Notes: PERMANENT — removes the file from both the database and cloud storage. Only the
           owner can delete it.

KEY RULES & PATTERNS

Password strength: min 8 chars, at least one uppercase, one lowercase, one number, and one
  special character from: @$!%*?&

Token storage: store accessToken from login/signup (localStorage or a secure cookie) and
  attach it to every protected request as Authorization: Bearer <token>

metadata field: free-form JSON per user — name, phone, plan, preferences, onboarding state,
  etc. PATCH /users/me deep-merges every update.

Email verification flow:
  signup (with redirectUrl) → email sent → user clicks link → GET /auth/verify-email →
  redirects to your redirectUrl

Password reset flow:
  forgot-password (with redirectUrl) → email sent → user clicks link →
  GET /auth/reset-password → redirects to YOUR redirectUrl?token=TOKEN → your page reads
  the token → POST /auth/update-password

Admin authentication: /users/ban and /mail/send-custom use an adminPass field instead of a
  JWT — it must match the ADMIN_PASS environment variable. Never call these from a public
  frontend.

Error handling: expect 400 for validation errors, 401 for missing/invalid tokens or wrong
  admin password, 404 for missing/not-owned resources. Avatar and media endpoints never
  reveal another user's data via 403 — they return 404 instead.`;

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
  "redirectUrl": "https://yourapp.com/dashboard", // required
  "metadata": {                           // optional
    "name": "Aaqil khan",
    "phone": "+1234567890",
    "plan": "free"
  }
}`,
        howToUse: `Call this on your signup form submission.<br><br>
<strong>email</strong> and <strong>password</strong> are required. Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character (<code>@$!%*?&amp;</code>).<br><br>
<strong>redirectUrl</strong> is the page on YOUR app that the user lands on after clicking the verification link. Auth-Pro redirects there cleanly — no token is appended.<br><br>
<strong>metadata</strong> accepts any JSON object. Store name, phone, role, plan, or anything else you need. These fields can be updated later with <code>PATCH /users/me</code> and are deep-merged on every update.<br><br>
The response returns an <code>accessToken</code> (JWT) immediately — the user is logged in right away even before verifying their email.`,
        exampleCode: `fetch('${base}/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'MyP@ssword1',
    redirectUrl: 'https://yourapp.com/dashboard',
    metadata: {
      name: 'Aaqil khan',
      plan: 'free'
    }
  })
})
.then(res => res.json())
.then(data => {
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
The token is a standard JWT. You can decode it client-side to read the user's <code>userId</code> from the <code>sub</code> claim.<br><br>
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
  "email": "user@example.com",
  "redirectUrl": "https://yourapp.com/reset-password"
}

// Response (always the same regardless of whether email exists):
// { "message": "If the email exists, a reset link has been sent." }`,
        howToUse: `Call this when the user clicks "Forgot Password?" on your login page.<br><br>
Auth-Pro generates a short-lived reset token and emails the user a link. That link redirects the user to YOUR <code>redirectUrl</code> with the token appended:<br>
<code>https://yourapp.com/reset-password?token=abc123xyz</code><br><br>
Your reset page must then:<br>
1. Read <code>token</code> from the URL<br>
2. Show a "New Password" input<br>
3. Call <code>POST /auth/update-password</code> with the token and new password<br><br>
The response is always the same message — even if the email doesn't exist. This prevents email enumeration attacks.`,
        exampleCode: `fetch('${base}/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    redirectUrl: 'https://yourapp.com/reset-password'
  })
})
.then(res => res.json())
.then(data => {
  alert('Check your inbox for a password reset link!');
});`,
      },

      {
        method: 'POST', path: '/auth/update-password',
        title: 'Update / Reset Password',
        description: 'Sets a new password using the one-time reset token delivered via the forgot-password email.',
        auth: false, admin: false,
        payloadLabel: 'Request Body (JSON)',
        payload: `{
  "token": "abc123xyz...",
  "newPassword": "NewP@ssword1"
}

// Response on success:
// { "message": "Password successfully updated." }`,
        howToUse: `Use this on your frontend reset-password page.<br><br>
<strong>Step 1 — Extract the token on page load:</strong><br>
<code>const token = new URLSearchParams(window.location.search).get('token');</code><br><br>
<strong>Step 2 — Show a "New Password" input to the user.</strong><br><br>
<strong>Step 3 — On form submit, call this endpoint</strong> with the token and new password.<br><br>
Reset tokens are <strong>single-use and time-limited</strong> — once used or expired, this endpoint returns 400. On success, redirect the user to the login page.`,
        exampleCode: `const resetToken = new URLSearchParams(window.location.search).get('token');

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
// token       (required) — the verification token
// redirectUrl (optional) — your frontend page to redirect to

// Example link in the email:
// ${base}/auth/verify-email
//   ?token=TOKEN&redirectUrl=https://yourapp.com/dashboard

// If redirectUrl is provided  → redirects the user to that URL
// If redirectUrl is omitted   → returns JSON: { "message": "Email successfully verified." }
// If token is invalid/expired → returns 400`,
        howToUse: `<strong>You don't call this endpoint in your code.</strong> It is the destination of the email verification link that Auth-Pro automatically sends when a user signs up.<br><br>
The full flow:<br>
1. User signs up via <code>POST /auth/signup</code> — you pass a <code>redirectUrl</code><br>
2. Auth-Pro sends the user a verification email with a link pointing to this endpoint<br>
3. User clicks the link — Auth-Pro marks their email as verified<br>
4. Auth-Pro redirects the user to your <code>redirectUrl</code><br><br>
To control where the user lands after verification, set the <code>redirectUrl</code> correctly during signup.`,
        exampleCode: `// You don't call this endpoint directly.
// Just pass the correct redirectUrl during signup:

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
});`,
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
// token       (required) — the reset token
// redirectUrl (optional) — your frontend reset-password page

// What happens:
// Auth-Pro redirects the user to:
//   https://yourapp.com/reset-password?token=TOKEN
// Your page then reads that token and calls POST /auth/update-password`,
        howToUse: `<strong>You don't call this endpoint in your code.</strong> It is the link inside the forgot-password email. When the user clicks it, Auth-Pro appends the token to your <code>redirectUrl</code> and redirects the browser.<br><br>
Example: if your <code>redirectUrl</code> is <code>https://yourapp.com/reset-password</code>, the user lands on:<br>
<code>https://yourapp.com/reset-password?token=abc123xyz</code><br><br>
Your page then extracts the token from the URL and calls <code>POST /auth/update-password</code>.<br><br>
Always set the redirectUrl in your forgot-password call.`,
        exampleCode: `// You don't call this endpoint directly.
// Set up the flow correctly in your forgot-password call:

fetch('${base}/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    redirectUrl: 'https://yourapp.com/reset-password'
  })
});

// Then on your /reset-password page:
const token = new URLSearchParams(window.location.search).get('token');
// Pass this token to POST /auth/update-password`,
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
  "avatarUrl": "https://cdn.example.com/avatars/abc.webp",
  "metadata": { "name": "Aaqil khan", "plan": "pro" },
  "isEmailVerified": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-06-01T12:00:00.000Z"
  // "password" is NEVER returned
}`,
        howToUse: `Call this on any page that needs user data — your dashboard, settings page, profile page, etc.<br><br>
The response includes:<br>
• <strong>id</strong> — unique user ID (needed for admin operations like ban)<br>
• <strong>email</strong> — the user's email address<br>
• <strong>avatarUrl</strong> — cloud CDN URL of their profile picture (<code>null</code> if not set)<br>
• <strong>metadata</strong> — any custom JSON you stored (<code>null</code> if nothing stored yet)<br>
• <strong>isEmailVerified</strong> — whether the user has clicked their verification email link<br><br>
The <code>password</code> field is <strong>never</strong> returned. Returns <strong>401</strong> if the token is missing, invalid, or expired.`,
        exampleCode: `const token = localStorage.getItem('token');

fetch('${base}/users/me', {
  headers: { 'Authorization': \`Bearer \${token}\` }
})
.then(res => {
  if (res.status === 401) throw new Error('Not authenticated');
  return res.json();
})
.then(user => {
  console.log('Email:', user.email);
  console.log('Verified:', user.isEmailVerified);
  if (user.avatarUrl) {
    document.querySelector('#avatar').src = user.avatarUrl;
  }
});`,
      },

      {
        method: 'PATCH', path: '/users/me',
        title: 'Update User Metadata',
        description: 'Deep-merges custom metadata into the user\'s profile. Only keys you send are updated — all existing metadata is preserved.',
        auth: true, admin: false,
        payloadLabel: 'Request Body (JSON)',
        payload: `{
  "metadata": {
    "displayName": "Alice",
    "theme": "dark",
    "onboardingStep": 3
  }
}

// IMPORTANT: This is a MERGE, not a replace.
// To delete a key, send it as null:
// { "metadata": { "oldKey": null } }`,
        howToUse: `Use this to save any custom user-level data — UI preferences, settings, onboarding state, plan details, etc.<br><br>
<strong>Merge behaviour:</strong> The server deep-merges your payload into existing metadata. Keys not included in your payload are untouched.<br><br>
<strong>Deleting a key:</strong> Send the key with a <code>null</code> value:<br>
<code>{ "metadata": { "keyToRemove": null } }</code><br><br>
Returns the full updated user object on success. Returns 401 if unauthenticated.`,
        exampleCode: `const token = localStorage.getItem('token');

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
    }
  })
})
.then(res => res.json())
.then(user => console.log('Updated metadata:', user.metadata));`,
      },

      {
        method: 'POST', path: '/users/avatar',
        title: 'Upload Profile Picture',
        description: 'Uploads a profile image for the authenticated user. Automatically compressed to WebP and stored in cloud storage.',
        auth: true, admin: false,
        payloadLabel: 'Multipart Form Data',
        payload: `// Authorization: Bearer YOUR_JWT_TOKEN
// Content-Type: multipart/form-data ← set AUTOMATICALLY, do NOT set manually

// Form Fields:
// file — (required) the image file (JPG, PNG, WebP, etc.)

// Response: full UserEntity with updated avatarUrl field`,
        howToUse: `Use an HTML <code>&lt;input type="file" accept="image/*"&gt;</code> to let the user pick an image. Build a <code>FormData</code> object and append the file under the key <code>"file"</code>.<br><br>
<strong>Critical:</strong> Do NOT set <code>Content-Type</code> manually. The browser adds it automatically with the correct multipart boundary string.<br><br>
The image is automatically compressed and converted to <strong>WebP format</strong> before being saved to cloud storage. Use <code>user.avatarUrl</code> as the <code>src</code> of an <code>&lt;img&gt;</code> tag to display the avatar.`,
        exampleCode: `const token = localStorage.getItem('token');
const fileInput = document.querySelector('#avatarInput');

fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file); // field name MUST be "file"

  const res = await fetch('${base}/users/avatar', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${token}\`
      // DO NOT add Content-Type here!
    },
    body: formData
  });

  const user = await res.json();
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
  "adminPass": "your-admin-password",
  "userId": "clx9ab12cd34ef56gh78"
}

// Returns 401 if adminPass is wrong
// Returns 404 if userId does not exist`,
        howToUse: `Admin-only endpoint — <strong>no JWT required</strong>. Authentication is done via the <code>adminPass</code> field, which must match the <code>ADMIN_PASS</code> environment variable on the server.<br><br>
To get a user's <code>userId</code>, call <code>GET /users/me</code> while authenticated as that user, or look it up in your database.<br><br>
<strong>Security:</strong> Never expose this endpoint or <code>adminPass</code> in a public frontend. Only call it from a secure server-side admin panel or CLI tool.`,
        exampleCode: `// Admin-only — run from a secure server-side context!

fetch('${base}/users/ban', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adminPass: 'your-admin-password',
    userId: 'clx9ab12cd34ef56gh78'
  })
})
.then(res => res.json())
.then(data => {
  if (data.statusCode === 401) console.error('Wrong admin password!');
  else if (data.statusCode === 404) console.error('User not found!');
  else console.log('User banned:', data.id);
});`,
      },

      {
        method: 'POST', path: '/mail/send-custom',
        title: 'Send Custom Email (Admin)',
        description: 'Sends a fully custom HTML email to any address on behalf of your application. Requires the admin password.',
        auth: false, admin: true,
        payloadLabel: 'Request Body (JSON)',
        payload: `{
  "adminPass": "your-admin-password",
  "to": "recipient@example.com",
  "subject": "Welcome to Our Platform!",
  "htmlTemplate": "<h1>Hello!</h1><p>...</p>"
}

// Response on success:
// { "message": "Email successfully sent." }`,
        howToUse: `Admin-only endpoint — no JWT required.<br><br>
The <code>htmlTemplate</code> field accepts complete HTML. Tips for best email client compatibility:<br>
• Use <strong>inline CSS</strong> (<code>style="..."</code> attributes) — most email clients strip external <code>&lt;style&gt;</code> tags<br>
• Use table-based layouts for complex designs<br>
• Keep image src URLs absolute<br><br>
Returns 401 if the admin password is wrong.`,
        exampleCode: `fetch('${base}/mail/send-custom', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adminPass: 'your-admin-password',
    to: 'newuser@example.com',
    subject: 'Welcome to Our Platform!',
    htmlTemplate: \`
      <div style="font-family:Arial,sans-serif;max-width:600px;padding:24px">
        <h1 style="color:#3b82f6">Welcome aboard!</h1>
        <p>Your account is ready.</p>
        <a href="https://yourapp.com/dashboard"
           style="display:inline-block;background:#3b82f6;color:#fff;
                  padding:12px 24px;text-decoration:none;border-radius:6px">
          Go to Dashboard
        </a>
      </div>
    \`
  })
})
.then(res => res.json())
.then(data => console.log(data.message));`,
      },

      {
        method: 'POST', path: '/media/images',
        title: 'Upload Image to Media Library',
        description: 'Uploads and compresses an image into the user\'s personal media library with a required tag for categorization.',
        auth: true, admin: false,
        payloadLabel: 'Multipart Form Data',
        payload: `// Authorization: Bearer YOUR_JWT_TOKEN
// Content-Type: set automatically by FormData

// Form Fields:
// file — (required) the image file
// tag  — (required) category label e.g. "blog-thumbnails"

// Response (MediaEntity):
{
  "id": "clx9ab12cd34ef56",
  "url": "https://cdn.example.com/media/images/uuid.webp",
  "tag": "blog-thumbnails",
  "mimeType": "image/webp",
  "size": 45312,
  "filename": "media/images/uuid.webp",
  "createdAt": "2025-06-01T00:00:00.000Z"
}`,
        howToUse: `This is different from <code>POST /users/avatar</code> — that sets one profile picture. This builds a <strong>full media library</strong> with multiple organized files per user.<br><br>
The <code>tag</code> field is required and is how you group and retrieve images later:<br>
• <code>"blog-thumbnails"</code> for article cover images<br>
• <code>"project-alpha"</code> for project-specific assets<br><br>
The image is compressed to <strong>WebP</strong> automatically. Save the response <code>id</code> if you need to delete the file later.`,
        exampleCode: `const token = localStorage.getItem('token');

async function uploadToMediaLibrary(file, tag) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tag', tag);

  const res = await fetch('${base}/media/images', {
    method: 'POST',
    headers: { 'Authorization': \`Bearer \${token}\` },
    body: formData
  });

  const media = await res.json();
  console.log('URL:', media.url);
  console.log('ID:', media.id); // save to delete later
  return media;
}`,
      },

      {
        method: 'GET', path: '/media',
        title: 'List User Media',
        description: 'Returns all media files uploaded by the authenticated user. Optionally filter by tag.',
        auth: true, admin: false,
        payloadLabel: 'Query Parameters (no request body)',
        payload: `// Authorization: Bearer YOUR_JWT_TOKEN

// Optional Query Parameter:
// ?tag=your-tag  — filter results to only files with this tag

// GET /media                     → all media files
// GET /media?tag=blog-thumbnails → only files tagged "blog-thumbnails"

// Returns [] (empty array) if no files found — not 404`,
        howToUse: `Call this to list all images the user has uploaded. Returns an array of <code>MediaEntity</code> objects.<br><br>
Use the optional <code>?tag=</code> query parameter to filter results by category. Each item includes:<br>
• <strong>id</strong> — use to fetch or delete a specific file<br>
• <strong>url</strong> — public CDN URL to display in an <code>&lt;img&gt;</code> tag<br>
• <strong>tag</strong> — the category label<br>
• <strong>size</strong> — file size in bytes after compression<br>
• <strong>createdAt</strong> — upload timestamp<br><br>
Returns an empty array <code>[]</code> if no files exist — not a 404.`,
        exampleCode: `const token = localStorage.getItem('token');

async function getMediaByTag(tag) {
  const url = \`${base}/media?tag=\${encodeURIComponent(tag)}\`;
  const res = await fetch(url, {
    headers: { 'Authorization': \`Bearer \${token}\` }
  });
  return res.json();
}

getMediaByTag('blog-thumbnails').then(images => {
  const gallery = document.querySelector('#gallery');
  images.forEach(img => {
    const el = document.createElement('img');
    el.src = img.url;
    el.dataset.mediaId = img.id;
    gallery.appendChild(el);
  });
});`,
      },

      {
        method: 'GET', path: '/media/:id',
        title: 'Get Single Media File',
        description: 'Returns the full details of a specific media file by its unique ID.',
        auth: true, admin: false,
        payloadLabel: 'Path Parameter (no request body)',
        payload: `// Authorization: Bearer YOUR_JWT_TOKEN
// :id — the unique media file ID

// Example: GET /media/clx9ab12cd34ef56gh78

// Response (MediaEntity):
{
  "id": "clx9ab12cd34ef56gh78",
  "url": "https://cdn.example.com/media/images/uuid.webp",
  "tag": "blog-thumbnails",
  "mimeType": "image/webp",
  "size": 45312,
  "createdAt": "2025-06-01T00:00:00.000Z"
}`,
        howToUse: `Use this to retrieve the complete details of a single uploaded file by its <code>id</code>.<br><br>
The <code>id</code> is returned when you upload an image and is included in every item from <code>GET /media</code>.<br><br>
<strong>Access control:</strong> Only returns files owned by the currently authenticated user. If the ID belongs to another user's file, the server returns 404 (not 403 — to prevent ID enumeration).`,
        exampleCode: `const token = localStorage.getItem('token');
const mediaId = 'clx9ab12cd34ef56gh78';

fetch(\`${base}/media/\${mediaId}\`, {
  headers: { 'Authorization': \`Bearer \${token}\` }
})
.then(res => {
  if (res.status === 404) throw new Error('File not found or access denied');
  return res.json();
})
.then(media => {
  console.log('URL:', media.url);
  document.querySelector('#previewImg').src = media.url;
});`,
      },

      {
        method: 'DELETE', path: '/media/:id',
        title: 'Delete Media File',
        description: 'Permanently deletes a media file from both the database and cloud storage. This action cannot be undone.',
        auth: true, admin: false,
        payloadLabel: 'Path Parameter (no request body)',
        payload: `// Authorization: Bearer YOUR_JWT_TOKEN
// :id — the unique media file ID to delete

// Example: DELETE /media/clx9ab12cd34ef56gh78

// Response on success:
// { "message": "Media successfully deleted" }

// After deletion:
// - The file's URL will return 404 from cloud storage
// - PERMANENT — cannot be undone`,
        howToUse: `Permanently deletes the media file — both the <strong>database record</strong> and the <strong>file in cloud storage</strong>. This is irreversible.<br><br>
Only the <strong>owner</strong> of the file can delete it. Attempting to delete another user's file returns 404.<br><br>
<strong>Best practice:</strong> Always confirm with the user before calling delete. Returns 401 if unauthenticated.`,
        exampleCode: `const token = localStorage.getItem('token');

async function deleteMedia(mediaId) {
  const confirmed = confirm('Delete this file? This cannot be undone.');
  if (!confirmed) return;

  const res = await fetch(\`${base}/media/\${mediaId}\`, {
    method: 'DELETE',
    headers: { 'Authorization': \`Bearer \${token}\` }
  });

  const data = await res.json();

  if (res.ok) {
    console.log(data.message);
    document.querySelector(\`[data-media-id="\${mediaId}"]\`)?.remove();
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
      POST: 'text-green-300 bg-green-500/20 border-green-500/40',
      GET: 'text-sky-300 bg-sky-500/20 border-sky-500/40',
      PATCH: 'text-orange-300 bg-orange-500/20 border-orange-500/40',
      DELETE: 'text-red-300 bg-red-500/20 border-red-500/40',
    };
    const borderLeft: Record<string, string> = {
      POST: 'border-l-green-500',
      GET: 'border-l-sky-500',
      PATCH: 'border-l-orange-500',
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
          <style>${this.sharedStyles()}
              code, pre { font-family: 'Fira Code', monospace; }
              #promptModal { display: none; }
              #promptModal.active { display: flex; animation: fadeIn 0.3s ease-out; }
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              .modal-content { animation: slideIn 0.3s ease-out; }
              @keyframes slideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
              .flashy-btn {
                  position: relative;
                  background: linear-gradient(90deg, #22d3ee, #6366f1, #d946ef);
                  background-size: 200% auto;
                  color: white;
                  animation: shine 3s linear infinite;
                  box-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
              }
              .flashy-btn:hover { box-shadow: 0 0 30px rgba(217, 70, 239, 0.6); }
              @keyframes shine { to { background-position: 200% center; } }
          </style>
      </head>
      <body class="min-h-screen flex flex-col relative overflow-x-hidden">
          ${this.renderBlobs()}

          ${this.renderNav(
            'docs',
            `<button onclick="document.getElementById('promptModal').classList.add('active')" class="flashy-btn px-4 sm:px-6 py-2.5 rounded-full font-bold transition-all transform hover:scale-105 flex items-center gap-2 text-sm">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      <span class="hidden sm:inline">Copy AI Prompt</span>
                  </button>`,
          )}

          <main class="flex-grow max-w-7xl w-full mx-auto p-4 md:p-8 z-10 pb-24">
              <div class="text-center mb-16 mt-8">
                  <span class="glass inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-sky-300 tracking-wide uppercase">15 Endpoints · Beginner Friendly</span>
                  <h1 class="text-5xl font-extrabold mb-6 mt-6 tracking-tight">API <span class="bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 text-gradient">Documentation</span></h1>
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
                      <h3 class="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-fuchsia-400 text-gradient">AI Implementation Prompt</h3>
                      <button onclick="document.getElementById('promptModal').classList.remove('active')" class="text-slate-400 hover:text-white transition bg-white/5 hover:bg-white/10 p-2 rounded-lg">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                  </div>
                  <div class="p-6 overflow-y-auto flex-grow bg-slate-950/50">
                      <p class="text-sm text-slate-300 mb-4 font-medium">Paste this into Claude, ChatGPT, or any AI to instantly generate your frontend auth integration!</p>
                      <div class="relative group">
                          <textarea id="promptText" readonly class="w-full h-72 bg-black/40 text-emerald-300 font-mono text-sm p-5 rounded-xl border border-white/10 focus:outline-none focus:border-fuchsia-500/50 resize-none shadow-inner">${aiPrompt}</textarea>
                      </div>
                  </div>
                  <div class="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
                      <button onclick="document.getElementById('promptModal').classList.remove('active')" class="px-6 py-2.5 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition font-medium">Close</button>
                      <button onclick="copyPrompt()" id="copyBtn" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold transition flex items-center gap-2 shadow-lg shadow-fuchsia-500/20">
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
                  btn.classList.add('bg-emerald-500', 'shadow-emerald-500/20');
                  btn.classList.remove('bg-gradient-to-r', 'from-violet-600', 'to-fuchsia-600', 'shadow-fuchsia-500/20');
                  setTimeout(() => {
                      btn.innerHTML = originalHtml;
                      btn.classList.remove('bg-emerald-500', 'shadow-emerald-500/20');
                      btn.classList.add('bg-gradient-to-r', 'from-violet-600', 'to-fuchsia-600', 'shadow-fuchsia-500/20');
                  }, 2000);
              }
          </script>
      </body>
      </html>
    `;
    res.type('text/html').send(html);
  }
}
