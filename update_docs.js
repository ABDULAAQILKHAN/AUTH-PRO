/**
 * Auth-Pro API Documentation Source
 *
 * This file is the canonical source of truth for all API endpoint documentation.
 * The actual rendered docs live in src/app.controller.ts → getDocs().
 *
 * If you add or modify an endpoint:
 *   1. Update the endpoint entry in the `endpoints` array below
 *   2. Mirror the change in the getDocs() method in src/app.controller.ts
 *
 * All 15 endpoints are documented here in the 6-section format:
 *   1. Endpoint (method + path)
 *   2. Title / name
 *   3. Short description (1 liner)
 *   4. Example payload (with required / optional field markers)
 *   5. How to use (detailed explanation)
 *   6. Example code (JavaScript / Fetch)
 */

const endpoints = [

  // ─────────────────────────────────────────────────────────────────────────
  // AUTH
  // ─────────────────────────────────────────────────────────────────────────

  {
    method: 'POST',
    path: '/auth/signup',
    title: 'Register a New User',
    description: 'Creates a new user account and immediately sends an email verification link to the provided address.',
    auth: false,
    admin: false,
    payload: `{
  "email": "user@example.com",            // required
  "password": "MyP@ssword1",              // required — min 8 chars, uppercase, lowercase, number & special char (@$!%*?&)
  "redirectUrl": "https://yourapp.com/dashboard", // required — your frontend page after email verification
  "metadata": {                           // optional — any custom JSON data to attach to the user
    "name": "John Doe",
    "phone": "+1234567890",
    "plan": "free"
  }
}`,
    howToUse: `Call this on signup form submission. email and password are required. redirectUrl is the page on YOUR
app the user lands on after clicking the verification link in their email (no token appended).
metadata accepts any JSON object — store name, phone, plan, etc. It is deep-merged on every update.
Returns { accessToken } immediately so the user is logged in right away. isEmailVerified will be false
until the user clicks the link.`,
    codeExample: `fetch('http://localhost:3000/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'MyP@ssword1',
    redirectUrl: 'https://yourapp.com/dashboard',
    metadata: { name: 'John Doe', plan: 'free' }
  })
})
.then(res => res.json())
.then(data => {
  localStorage.setItem('token', data.accessToken);
});`,
  },

  {
    method: 'POST',
    path: '/auth/login',
    title: 'Login User',
    description: 'Authenticates an existing user with email and password and returns a JWT access token.',
    auth: false,
    admin: false,
    payload: `{
  "email": "user@example.com",  // required
  "password": "MyP@ssword1"     // required
}
// Response: { "accessToken": "eyJhbG..." }`,
    howToUse: `Call this on login form submission. On success you receive { accessToken }. Store it in localStorage
or a secure cookie — you need it for every protected route. Attach it as:
Authorization: Bearer <token>
The token is a standard JWT. Decode it client-side with jwt-decode to read the userId from the sub claim.
Returns 401 if credentials are wrong or the user is banned.`,
    codeExample: `fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'MyP@ssword1' })
})
.then(res => res.json())
.then(data => {
  localStorage.setItem('token', data.accessToken);
  window.location.href = '/dashboard';
});`,
  },

  {
    method: 'POST',
    path: '/auth/forgot-password',
    title: 'Forgot Password',
    description: 'Sends a secure, single-use password reset link to the user\'s email address.',
    auth: false,
    admin: false,
    payload: `{
  "email": "user@example.com",                         // required
  "redirectUrl": "https://yourapp.com/reset-password"  // required — your frontend reset page
}
// Response (always same regardless of whether email exists):
// { "message": "If the email exists, a reset link has been sent." }`,
    howToUse: `Call this when the user clicks "Forgot Password?". Auth-Pro emails a reset link to:
GET /auth/reset-password?token=TOKEN&redirectUrl=YOUR_URL
That endpoint redirects the user to YOUR redirectUrl with ?token=TOKEN appended.
Your reset page must read the token from the URL and call POST /auth/update-password.
Response is always the same message to prevent email enumeration.`,
    codeExample: `fetch('http://localhost:3000/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    redirectUrl: 'https://yourapp.com/reset-password'
  })
})
.then(() => alert('Check your inbox for a reset link!'));`,
  },

  {
    method: 'POST',
    path: '/auth/update-password',
    title: 'Update / Reset Password',
    description: 'Sets a new password using the one-time reset token delivered via the forgot-password email.',
    auth: false,
    admin: false,
    payload: `{
  "token": "abc123xyz...",         // required — from URL query param (?token=...)
  "newPassword": "NewP@ssword1"    // required — same rules: min 8 chars, uppercase, lowercase, number, special char
}
// Response: { "message": "Password successfully updated." }`,
    howToUse: `Use this on your reset-password page. On load, extract the token:
  const token = new URLSearchParams(window.location.search).get('token');
Show a "New Password" input, then on submit send token + newPassword here.
Tokens are single-use and expire — invalid/expired tokens return 400.
On success redirect the user to login.`,
    codeExample: `const resetToken = new URLSearchParams(window.location.search).get('token');

document.querySelector('#resetForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const res = await fetch('http://localhost:3000/auth/update-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: resetToken, newPassword: 'NewP@ssword1' })
  });
  if (res.ok) window.location.href = '/login';
  else alert('Invalid or expired token.');
});`,
  },

  {
    method: 'GET',
    path: '/auth/verify-email?token=...&redirectUrl=...',
    title: 'Verify Email Address',
    description: 'Confirms a user\'s email via the token sent at signup. Clicked directly from the email — not called in code.',
    auth: false,
    admin: false,
    payload: `// No request body.
// Query params: token (required), redirectUrl (optional)
// This link is inside the verification email. The user clicks it directly.
// If redirectUrl provided → redirects to that URL
// If omitted → returns { "message": "Email successfully verified." }`,
    howToUse: `You do not call this endpoint. Auth-Pro sends it automatically after signup.
Flow:
1. User signs up with redirectUrl in body
2. Auth-Pro emails a link: /auth/verify-email?token=TOKEN&redirectUrl=YOUR_URL
3. User clicks the link — email marked as verified
4. Auth-Pro redirects to your redirectUrl
Set the correct redirectUrl during signup to control where the user lands post-verification.`,
    codeExample: `// You don't call this — just pass the correct redirectUrl during signup:
fetch('http://localhost:3000/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'MyP@ssword1',
    redirectUrl: 'https://yourapp.com/dashboard', // user lands here after clicking verification email
    metadata: { name: 'Alice' }
  })
});`,
  },

  {
    method: 'GET',
    path: '/auth/reset-password?token=...&redirectUrl=...',
    title: 'Password Reset Redirect',
    description: 'Validates the reset link from email and redirects the user to your frontend with the token in the URL.',
    auth: false,
    admin: false,
    payload: `// No request body.
// Query params: token (required), redirectUrl (optional)
// This link is inside the forgot-password email. User clicks it.
// Redirects to: YOUR_redirectUrl?token=TOKEN
// If no redirectUrl → returns { token } as JSON`,
    howToUse: `You do not call this endpoint. It's the link inside the forgot-password email.
When clicked, Auth-Pro appends the token to your redirectUrl:
  https://yourapp.com/reset-password?token=abc123xyz
Your page reads that token and calls POST /auth/update-password.
Set the redirectUrl correctly in the forgot-password call.`,
    codeExample: `// Set the redirectUrl correctly in your forgot-password call:
fetch('http://localhost:3000/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    redirectUrl: 'https://yourapp.com/reset-password' // user lands here with ?token=TOKEN
  })
});`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // USERS
  // ─────────────────────────────────────────────────────────────────────────

  {
    method: 'GET',
    path: '/users/me',
    title: 'Get Current User Profile',
    description: 'Returns the full profile of the authenticated user including id, email, avatarUrl, metadata, and verification status.',
    auth: true,
    admin: false,
    payload: `// No request body.
// Required header: Authorization: Bearer YOUR_JWT_TOKEN
// Response:
{
  "id": "clx9ab12...",
  "email": "user@example.com",
  "avatarUrl": "https://cdn.example.com/...",  // null if not set
  "metadata": { "name": "Alice", "plan": "pro" }, // null if not set
  "isEmailVerified": true,
  "createdAt": "...", "updatedAt": "..."
  // "password" is NEVER returned
}`,
    howToUse: `Call on any authenticated page to load the user's data.
Attach the JWT as:  Authorization: Bearer <your-token>
Returns id, email, avatarUrl, metadata, isEmailVerified, createdAt, updatedAt.
password is never returned.
Returns 401 if token is missing, invalid, or expired.`,
    codeExample: `const token = localStorage.getItem('token');

fetch('http://localhost:3000/users/me', {
  headers: { 'Authorization': \`Bearer \${token}\` }
})
.then(res => res.json())
.then(user => {
  console.log('Email:', user.email);
  console.log('Verified:', user.isEmailVerified);
  if (user.avatarUrl) document.querySelector('#avatar').src = user.avatarUrl;
  console.log('Custom data:', user.metadata);
});`,
  },

  {
    method: 'PATCH',
    path: '/users/me',
    title: 'Update User Metadata',
    description: 'Deep-merges custom metadata into the user\'s profile. Only keys you send are updated — all existing metadata is preserved.',
    auth: true,
    admin: false,
    payload: `// Required header: Authorization: Bearer YOUR_JWT_TOKEN
{
  "metadata": {              // optional — any JSON object
    "displayName": "Alice",
    "theme": "dark",
    "newsletterOptIn": true,
    "onboardingComplete": true
  }
}
// This is a MERGE — keys not in your payload are untouched.
// To remove a key send it as null: { "metadata": { "key": null } }`,
    howToUse: `Use this to save any custom user data — preferences, settings, onboarding state, etc.
Deep-merge: if user has metadata.theme = "light" and you send { "metadata": { "theme": "dark" } },
only theme changes. All other metadata keys are preserved.
To delete a metadata key send it as null.
Returns the full updated user object. Requires valid JWT.`,
    codeExample: `const token = localStorage.getItem('token');

fetch('http://localhost:3000/users/me', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`
  },
  body: JSON.stringify({
    metadata: { theme: 'dark', onboardingComplete: true }
  })
})
.then(res => res.json())
.then(user => console.log('Updated metadata:', user.metadata));`,
  },

  {
    method: 'POST',
    path: '/users/avatar',
    title: 'Upload Profile Picture',
    description: 'Uploads a profile image for the authenticated user. Auto-compressed to WebP and stored in cloud storage.',
    auth: true,
    admin: false,
    payload: `// Required header: Authorization: Bearer YOUR_JWT_TOKEN
// Content-Type: multipart/form-data  ← set AUTOMATICALLY — do NOT set manually
// Form field: file (required) — the image file (JPG, PNG, WebP, etc.)
// Response: full UserEntity with updated avatarUrl`,
    howToUse: `Use FormData with the field name "file". Do NOT set Content-Type manually — the browser sets
it automatically with the correct boundary. Setting it manually breaks the upload.
The image is compressed to WebP before storage.
After upload, user.avatarUrl contains the new CDN URL.`,
    codeExample: `const token = localStorage.getItem('token');
const fileInput = document.querySelector('#avatarInput');

fileInput.addEventListener('change', async () => {
  const formData = new FormData();
  formData.append('file', fileInput.files[0]); // must be "file"

  const res = await fetch('http://localhost:3000/users/avatar', {
    method: 'POST',
    headers: { 'Authorization': \`Bearer \${token}\` }, // NO Content-Type!
    body: formData
  });
  const user = await res.json();
  document.querySelector('#avatarImg').src = user.avatarUrl;
});`,
  },

  {
    method: 'POST',
    path: '/users/ban',
    title: 'Ban User (Admin)',
    description: 'Permanently bans a user by ID. Requires the server-side admin password. No JWT needed.',
    auth: false,
    admin: true,
    payload: `{
  "adminPass": "your-admin-password",  // required — must match ADMIN_PASS env variable
  "userId": "clx9ab12cd34ef56gh78"     // required — the user's unique ID
}
// Returns 401 if adminPass is wrong
// Returns 404 if userId not found`,
    howToUse: `No JWT required — authenticated via adminPass matching the ADMIN_PASS env variable.
Get the userId from GET /users/me while logged in as that user, or from your database.
Banning sets isEmailVerified = false, preventing login.
Never expose this or adminPass in a public frontend — use only from server-side admin tools.`,
    codeExample: `// Admin only — call from a secure server-side context!
fetch('http://localhost:3000/users/ban', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adminPass: 'your-admin-password',
    userId: 'clx9ab12cd34ef56gh78'
  })
})
.then(res => res.json())
.then(data => console.log('User banned:', data.id));`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MAIL
  // ─────────────────────────────────────────────────────────────────────────

  {
    method: 'POST',
    path: '/mail/send-custom',
    title: 'Send Custom Email (Admin)',
    description: 'Sends a fully custom HTML email to any address. Requires the admin password.',
    auth: false,
    admin: true,
    payload: `{
  "adminPass": "your-admin-password",           // required — must match ADMIN_PASS env variable
  "to": "recipient@example.com",                // required — recipient email
  "subject": "Welcome to Our Platform!",        // required — email subject
  "htmlTemplate": "<h1>Hello!</h1><p>...</p>"   // required — full HTML body (use inline CSS)
}
// Response: { "message": "Email successfully sent." }`,
    howToUse: `No JWT required — authenticated via adminPass.
The htmlTemplate field accepts full HTML. Use inline CSS (style="...") for best email client
compatibility — many clients strip <style> tags.
Use for onboarding emails, announcements, or custom transactional notifications.`,
    codeExample: `fetch('http://localhost:3000/mail/send-custom', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    adminPass: 'your-admin-password',
    to: 'user@example.com',
    subject: 'Welcome!',
    htmlTemplate: \`
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h1 style="color:#3b82f6;">Welcome aboard!</h1>
        <p>Your account is ready.</p>
        <a href="https://yourapp.com/dashboard"
           style="background:#3b82f6;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">
          Go to Dashboard
        </a>
      </div>
    \`
  })
})
.then(res => res.json())
.then(data => console.log(data.message));`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MEDIA
  // ─────────────────────────────────────────────────────────────────────────

  {
    method: 'POST',
    path: '/media/images',
    title: 'Upload Image to Media Library',
    description: 'Uploads and compresses an image into the user\'s media library with a required tag for categorization.',
    auth: true,
    admin: false,
    payload: `// Required header: Authorization: Bearer YOUR_JWT_TOKEN
// Content-Type: multipart/form-data (set automatically)
// Form fields:
// file — (required) image file (JPG, PNG, WebP, etc.)
// tag  — (required) categorization label, e.g. "blog-thumbnails", "project-alpha"
// Response: MediaEntity { id, url, tag, mimeType, size, filename, createdAt }`,
    howToUse: `Different from /users/avatar — this builds a full media library with multiple files per user.
The tag is required and is how you group and retrieve images. Use GET /media?tag=... to fetch by tag.
The image is compressed to WebP automatically.
Save the returned id if you need to delete the file later.
Do NOT set Content-Type — FormData sets it automatically.`,
    codeExample: `const token = localStorage.getItem('token');

async function uploadImage(file, tag) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tag', tag);

  const res = await fetch('http://localhost:3000/media/images', {
    method: 'POST',
    headers: { 'Authorization': \`Bearer \${token}\` }, // NO Content-Type!
    body: formData
  });
  const media = await res.json();
  console.log('URL:', media.url, '| ID:', media.id, '| Tag:', media.tag);
  return media;
}`,
  },

  {
    method: 'GET',
    path: '/media',
    title: 'List User Media',
    description: 'Returns all media files uploaded by the authenticated user. Optionally filter by tag.',
    auth: true,
    admin: false,
    payload: `// Required header: Authorization: Bearer YOUR_JWT_TOKEN
// Optional query param: ?tag=your-tag
// Examples:
// GET /media                       → all media for the user
// GET /media?tag=blog-thumbnails   → only files tagged "blog-thumbnails"
// Response: MediaEntity[]  (empty array [] if none found — not 404)`,
    howToUse: `Returns an array of all the user's uploaded media. Use ?tag= to filter by category.
Each item has: id (for get/delete), url (CDN link for display), tag, size, createdAt.
Returns [] if no files match — not a 404.`,
    codeExample: `const token = localStorage.getItem('token');

// All media:
fetch('http://localhost:3000/media', {
  headers: { 'Authorization': \`Bearer \${token}\` }
}).then(r => r.json()).then(console.log);

// Filter by tag:
const tag = 'blog-thumbnails';
fetch(\`http://localhost:3000/media?tag=\${encodeURIComponent(tag)}\`, {
  headers: { 'Authorization': \`Bearer \${token}\` }
})
.then(r => r.json())
.then(images => images.forEach(img => {
  const el = document.createElement('img');
  el.src = img.url;
  document.querySelector('#gallery').appendChild(el);
}));`,
  },

  {
    method: 'GET',
    path: '/media/:id',
    title: 'Get Single Media File',
    description: 'Returns the full details of a specific media file by its unique ID.',
    auth: true,
    admin: false,
    payload: `// Required header: Authorization: Bearer YOUR_JWT_TOKEN
// Path param: :id — the media file's unique ID
// Example: GET /media/clx9ab12cd34ef56gh78
// Response: MediaEntity { id, userId, email, url, type, filename, mimeType, size, tag, createdAt }
// Returns 404 if not found or owned by a different user`,
    howToUse: `Use this to get full details of a single file. The id comes from the upload response or GET /media.
Only returns files owned by the authenticated user — another user's file ID returns 404 (not 403).`,
    codeExample: `const token = localStorage.getItem('token');
const mediaId = 'clx9ab12cd34ef56gh78';

fetch(\`http://localhost:3000/media/\${mediaId}\`, {
  headers: { 'Authorization': \`Bearer \${token}\` }
})
.then(res => {
  if (!res.ok) throw new Error('Not found');
  return res.json();
})
.then(media => {
  console.log('URL:', media.url);
  console.log('Tag:', media.tag, '| Size:', media.size, 'bytes');
  document.querySelector('#preview').src = media.url;
});`,
  },

  {
    method: 'DELETE',
    path: '/media/:id',
    title: 'Delete Media File',
    description: 'Permanently deletes a media file from both the database and cloud storage. Irreversible.',
    auth: true,
    admin: false,
    payload: `// Required header: Authorization: Bearer YOUR_JWT_TOKEN
// Path param: :id — the media file ID to delete
// Example: DELETE /media/clx9ab12cd34ef56gh78
// Response: { "message": "Media successfully deleted" }
// After deletion: the file URL returns 404, the file is gone from GET /media
// Returns 401 if unauthenticated, 404 if file not found or not owned by user`,
    howToUse: `Permanently deletes the file from both the database and cloud storage. Cannot be undone.
Only the owner can delete their own files. Another user's file ID returns 404.
After deletion, clean up any references to the URL in your database or UI.
Always confirm with the user before calling — it's permanent.`,
    codeExample: `const token = localStorage.getItem('token');

async function deleteMedia(mediaId) {
  if (!confirm('Delete this file? This cannot be undone.')) return;

  const res = await fetch(\`http://localhost:3000/media/\${mediaId}\`, {
    method: 'DELETE',
    headers: { 'Authorization': \`Bearer \${token}\` }
  });
  const data = await res.json();

  if (res.ok) {
    console.log(data.message); // "Media successfully deleted"
    document.querySelector(\`[data-media-id="\${mediaId}"]\`)?.remove();
  } else {
    console.error('Delete failed:', data);
  }
}`,
  },

];

// ─────────────────────────────────────────────────────────────────────────────
// Quick summary printout (run: node update_docs.js)
// ─────────────────────────────────────────────────────────────────────────────
console.log('Auth-Pro API — All Endpoints:\n');
endpoints.forEach((ep, i) => {
  const badges = [
    ep.auth  ? '[Auth]'  : '',
    ep.admin ? '[Admin]' : '',
  ].filter(Boolean).join(' ');
  console.log(`  ${String(i + 1).padStart(2, ' ')}. ${ep.method.padEnd(7)} ${ep.path.padEnd(48)} ${badges}`);
});
console.log(`\nTotal: ${endpoints.length} endpoints`);
console.log('\nTo update /docs, edit src/app.controller.ts → getDocs() method.');
