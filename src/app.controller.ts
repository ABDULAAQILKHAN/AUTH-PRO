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
    const aiPrompt = `You are an expert AI coding assistant. The user wants to integrate authentication into their frontend application using the Auth-Pro microservice.
Base URL: ${process.env.API_URL || 'http://localhost:3000'}

Available Endpoints:
1. POST /auth/signup
   - Payload: { email, password, firstName, lastName, redirectUrl (optional) }
   - Behavior: Creates a user, sends verification email. Returns a JWT token.

2. POST /auth/login
   - Payload: { email, password }
   - Behavior: Authenticates the user. Returns a JWT token.

3. POST /auth/forgot-password
   - Payload: { email, redirectUrl (optional) }
   - Behavior: Sends a reset password email.

4. POST /auth/update-password
   - Payload: { token, newPassword }
   - Behavior: Updates the user's password using the token received in email.

5. GET /auth/verify-email?token=...&redirectUrl=...
   - Behavior: Verifies the email address. If redirectUrl is provided, it redirects the user there.

6. GET /auth/reset-password?token=...&redirectUrl=...
   - Behavior: Redirects to the frontend password reset page (redirectUrl) with the token appended to the URL.

7. GET /users/me
   - Payload: Bearer Token in Authorization header.
   - Behavior: Returns the current user's profile data.
   
8. PATCH /users/me
   - Payload: { metadata: { ... } } (plus Bearer token)
   - Behavior: Updates custom metadata for the current user.

9. POST /users/avatar
   - Payload: multipart/form-data with 'file' field (plus Bearer token)
   - Behavior: Uploads an avatar image and returns the updated user profile.

10. POST /users/ban
   - Payload: { adminPass, userId }
   - Behavior: Bans a user by setting isEmailVerified to false.

11. POST /mail/send-custom
   - Payload: { adminPass, to, subject, htmlTemplate }
   - Behavior: Sends a custom HTML email to a specific user.

12. POST /media/images
   - Payload: multipart/form-data with 'file' and 'tag' fields (plus Bearer token)
   - Behavior: Uploads, compresses (to WebP), and saves an image, returning the URL.

13. GET /media
   - Payload: Bearer token (optional ?tag= query)
   - Behavior: Returns a list of uploaded media files.

14. GET /media/:id
   - Payload: Bearer token
   - Behavior: Returns metadata for a specific media file.

15. DELETE /media/:id
   - Payload: Bearer token
   - Behavior: Deletes the specified media file.

How to utilize:
- Create a signup form sending data to POST /auth/signup. If using a frontend framework, pass \`redirectUrl\` so the verification email links back to your app.
- Create a login form sending data to POST /auth/login. Store the returned JWT token securely (e.g., localStorage).
- For password reset, implement a form that calls POST /auth/forgot-password. Pass a \`redirectUrl\` pointing to your frontend's reset-password route.
- The reset-password route on your frontend should extract the \`token\` from the URL query params and allow the user to set a new password, sending it to POST /auth/update-password.
- Attach the JWT token as a Bearer token in the Authorization header for any subsequent protected API requests.
- Integrate the \`/users/me\` and \`/users/avatar\` routes in your profile dashboard settings.`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Auth-Pro Documentation</title>
          <link rel="icon" href="/favicon.ico">
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
          <style>
              body { font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f8fafc; }
              .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
              .text-gradient { background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
              
              /* Modal styles */
              #promptModal { display: none; }
              #promptModal.active { display: flex; animation: fadeIn 0.3s ease-out; }
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              .modal-content { animation: slideIn 0.3s ease-out; }
              @keyframes slideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
              
              /* Flashy Button */
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
      <body class="min-h-screen flex flex-col relative">
          <!-- Navbar -->
          <nav class="w-full glass z-20 px-8 py-4 flex justify-between items-center sticky top-0">
              <a href="/" class="flex items-center gap-3 group">
                  <img src="/icon.png" alt="Auth-Pro Icon" class="w-10 h-10 rounded-lg shadow-lg shadow-sky-500/20 group-hover:scale-105 transition">
                  <span class="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 text-gradient">Auth-Pro</span>
              </a>
              <button onclick="document.getElementById('promptModal').classList.add('active')" class="flashy-btn px-6 py-2 rounded-full font-bold transition-all transform hover:scale-105 flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Copy AI Prompt
              </button>
          </nav>

          <!-- Main Docs Content -->
          <main class="flex-grow max-w-5xl w-full mx-auto p-8 z-10 pb-20">
              <h1 class="text-4xl font-bold mb-8">API Documentation</h1>
              <p class="text-slate-400 mb-12 text-lg">Detailed guide on how to integrate and utilize the Auth-Pro endpoints in your application.</p>
              
              <div class="space-y-8">
                  <!-- API Block -->
                  <div class="glass p-6 rounded-xl border-l-4 border-l-sky-500">
                      <div class="flex items-center gap-4 mb-4">
                          <span class="bg-green-500/20 text-green-400 px-3 py-1 rounded font-mono text-sm font-bold">POST</span>
                          <h2 class="text-xl font-semibold font-mono">/auth/signup</h2>
                      </div>
                      <p class="text-slate-300 mb-4">Registers a new user and sends an email verification link.</p>
                      <div class="bg-slate-900 rounded p-4 font-mono text-sm text-slate-300 mb-4 overflow-x-auto">
                          Payload: { "email": "user@example.com", "password": "...", "firstName": "John", "lastName": "Doe", "redirectUrl": "https://myapp.com/verify" }
                      </div>
                      <p class="text-sm text-slate-400"><strong>How to use:</strong> Call this from your registration form. Provide <code>redirectUrl</code> to bring the user back to your frontend after they click the email link.</p>
                  </div>

                  <div class="glass p-6 rounded-xl border-l-4 border-l-sky-500">
                      <div class="flex items-center gap-4 mb-4">
                          <span class="bg-green-500/20 text-green-400 px-3 py-1 rounded font-mono text-sm font-bold">POST</span>
                          <h2 class="text-xl font-semibold font-mono">/auth/login</h2>
                      </div>
                      <p class="text-slate-300 mb-4">Authenticates the user and returns a JWT token.</p>
                      <div class="bg-slate-900 rounded p-4 font-mono text-sm text-slate-300 mb-4 overflow-x-auto">
                          Payload: { "email": "user@example.com", "password": "..." }
                      </div>
                      <p class="text-sm text-slate-400"><strong>How to use:</strong> Use this for your login form. Store the resulting token and send it as a Bearer token for protected routes.</p>
                  </div>

                  <div class="glass p-6 rounded-xl border-l-4 border-l-sky-500">
                      <div class="flex items-center gap-4 mb-4">
                          <span class="bg-green-500/20 text-green-400 px-3 py-1 rounded font-mono text-sm font-bold">POST</span>
                          <h2 class="text-xl font-semibold font-mono">/auth/forgot-password</h2>
                      </div>
                      <p class="text-slate-300 mb-4">Initiates the password reset process by sending an email.</p>
                      <div class="bg-slate-900 rounded p-4 font-mono text-sm text-slate-300 mb-4 overflow-x-auto">
                          Payload: { "email": "user@example.com", "redirectUrl": "https://myapp.com/reset-password" }
                      </div>
                      <p class="text-sm text-slate-400"><strong>How to use:</strong> When a user forgets their password, call this. They will receive an email with a link pointing to your <code>redirectUrl</code> with a token attached.</p>
                  </div>

                  <div class="glass p-6 rounded-xl border-l-4 border-l-sky-500">
                      <div class="flex items-center gap-4 mb-4">
                          <span class="bg-green-500/20 text-green-400 px-3 py-1 rounded font-mono text-sm font-bold">POST</span>
                          <h2 class="text-xl font-semibold font-mono">/auth/update-password</h2>
                      </div>
                      <p class="text-slate-300 mb-4">Updates the password using a valid reset token.</p>
                      <div class="bg-slate-900 rounded p-4 font-mono text-sm text-slate-300 mb-4 overflow-x-auto">
                          Payload: { "token": "jwt-reset-token...", "newPassword": "new-secure-password" }
                      </div>
                      <p class="text-sm text-slate-400"><strong>How to use:</strong> In your frontend reset password page, extract the token from the URL, ask the user for a new password, and submit both to this endpoint.</p>
                  </div>
                  
                  <div class="glass p-6 rounded-xl border-l-4 border-l-blue-500">
                      <div class="flex items-center gap-4 mb-4">
                          <span class="bg-blue-500/20 text-blue-400 px-3 py-1 rounded font-mono text-sm font-bold">GET</span>
                          <h2 class="text-xl font-semibold font-mono">/auth/verify-email</h2>
                      </div>
                      <p class="text-slate-300 mb-4">Verifies the email via token. Mostly triggered directly from the email link.</p>
                      <p class="text-sm text-slate-400"><strong>How to use:</strong> You generally don't call this from JS. The email contains a link to this endpoint, which will verify the token and then 302 Redirect to your <code>redirectUrl</code>.</p>
                  </div>
                  
                  <div class="glass p-6 rounded-xl border-l-4 border-l-blue-500">
                      <div class="flex items-center gap-4 mb-4">
                          <span class="bg-blue-500/20 text-blue-400 px-3 py-1 rounded font-mono text-sm font-bold">GET</span>
                          <h2 class="text-xl font-semibold font-mono">/users/me</h2>
                      </div>
                      <p class="text-slate-300 mb-4">Retrieves the current user's profile data.</p>
                      <div class="bg-slate-900 rounded p-4 font-mono text-sm text-slate-300 mb-4 overflow-x-auto">
                          Headers: { "Authorization": "Bearer jwt-token..." }
                      </div>
                      <p class="text-sm text-slate-400"><strong>How to use:</strong> Fetch the authenticated user's details to populate your UI.</p>
                  </div>

                  <div class="glass p-6 rounded-xl border-l-4 border-l-orange-500">
                      <div class="flex items-center gap-4 mb-4">
                          <span class="bg-orange-500/20 text-orange-400 px-3 py-1 rounded font-mono text-sm font-bold">PATCH</span>
                          <h2 class="text-xl font-semibold font-mono">/users/me</h2>
                      </div>
                      <p class="text-slate-300 mb-4">Updates custom metadata for the current user.</p>
                      <div class="bg-slate-900 rounded p-4 font-mono text-sm text-slate-300 mb-4 overflow-x-auto">
                          Payload: { "metadata": { "theme": "dark", "preferences": {} } }<br>
                          Headers: { "Authorization": "Bearer jwt-token..." }
                      </div>
                      <p class="text-sm text-slate-400"><strong>How to use:</strong> Store user-specific application preferences or extended data.</p>
                  </div>

                  <div class="glass p-6 rounded-xl border-l-4 border-l-sky-500">
                      <div class="flex items-center gap-4 mb-4">
                          <span class="bg-green-500/20 text-green-400 px-3 py-1 rounded font-mono text-sm font-bold">POST</span>
                          <h2 class="text-xl font-semibold font-mono">/users/avatar</h2>
                      </div>
                      <p class="text-slate-300 mb-4">Uploads an avatar image for the current user.</p>
                      <div class="bg-slate-900 rounded p-4 font-mono text-sm text-slate-300 mb-4 overflow-x-auto">
                          Payload: multipart/form-data (field: 'file')<br>
                          Headers: { "Authorization": "Bearer jwt-token..." }
                      </div>
                      <p class="text-sm text-slate-400"><strong>How to use:</strong> Use a standard file input in your frontend to upload profile pictures.</p>
                  </div>

                  <div class="glass p-6 rounded-xl border-l-4 border-l-red-500">
                      <div class="flex items-center gap-4 mb-4">
                          <span class="bg-green-500/20 text-green-400 px-3 py-1 rounded font-mono text-sm font-bold">POST</span>
                          <h2 class="text-xl font-semibold font-mono">/users/ban</h2>
                      </div>
                      <p class="text-slate-300 mb-4">Admin endpoint to ban a user (sets isEmailVerified to false).</p>
                      <div class="bg-slate-900 rounded p-4 font-mono text-sm text-slate-300 mb-4 overflow-x-auto">
                          Payload: { "adminPass": "your-secret", "userId": "uuid..." }
                      </div>
                      <p class="text-sm text-slate-400"><strong>How to use:</strong> Integrate with your admin dashboard to quickly revoke user access.</p>
                  </div>

                  <div class="glass p-6 rounded-xl border-l-4 border-l-purple-500">
                      <div class="flex items-center gap-4 mb-4">
                          <span class="bg-green-500/20 text-green-400 px-3 py-1 rounded font-mono text-sm font-bold">POST</span>
                          <h2 class="text-xl font-semibold font-mono">/mail/send-custom</h2>
                      </div>
                      <p class="text-slate-300 mb-4">Admin endpoint to send custom HTML emails.</p>
                      <div class="bg-slate-900 rounded p-4 font-mono text-sm text-slate-300 mb-4 overflow-x-auto">
                          Payload: { "adminPass": "your-secret", "to": "user@ex.com", "subject": "Hello", "htmlTemplate": "&lt;h1&gt;Hi&lt;/h1&gt;" }
                      </div>
                      <p class="text-sm text-slate-400"><strong>How to use:</strong> Create a back-office tool to send announcements or personalized notifications.</p>
                  </div>

                  <!-- API Block: Media Upload -->
                  <div class="glass p-6 rounded-xl border-l-4 border-l-yellow-500 md:col-span-2">
                      <div class="flex items-center gap-4 mb-4">
                          <span class="bg-green-500/20 text-green-400 px-3 py-1 rounded font-mono text-sm font-bold">POST</span>
                          <h2 class="text-xl font-semibold font-mono">/media/images</h2>
                      </div>
                      <p class="text-slate-300 mb-4">Uploads an image, natively compresses it to WebP, and saves it to cloud storage.</p>
                      <div class="bg-slate-900 rounded p-4 font-mono text-sm text-slate-300 mb-4 overflow-x-auto">
                          Payload: multipart/form-data (fields: 'file', 'tag')<br>
                          Headers: { "Authorization": "Bearer jwt-token..." }
                      </div>
                      <p class="text-sm text-slate-400"><strong>How to use:</strong> Easily attach images to records using a unified tag (like 'project-x') to filter later.</p>
                  </div>

                  <!-- API Block: Get Media -->
                  <div class="glass p-6 rounded-xl border-l-4 border-l-yellow-500">
                      <div class="flex items-center gap-4 mb-4">
                          <span class="bg-blue-500/20 text-blue-400 px-3 py-1 rounded font-mono text-sm font-bold">GET</span>
                          <h2 class="text-xl font-semibold font-mono">/media</h2>
                      </div>
                      <p class="text-slate-300 mb-4">Returns a list of your uploaded media. Use ?tag= query to filter.</p>
                      <div class="bg-slate-900 rounded p-4 font-mono text-sm text-slate-300 mb-4 overflow-x-auto">
                          Headers: { "Authorization": "Bearer jwt-token..." }
                      </div>
                  </div>

                  <!-- API Block: Delete Media -->
                  <div class="glass p-6 rounded-xl border-l-4 border-l-yellow-500">
                      <div class="flex items-center gap-4 mb-4">
                          <span class="bg-red-500/20 text-red-400 px-3 py-1 rounded font-mono text-sm font-bold">DELETE</span>
                          <h2 class="text-xl font-semibold font-mono">/media/:id</h2>
                      </div>
                      <p class="text-slate-300 mb-4">Deletes a specific media file from cloud storage and database.</p>
                      <div class="bg-slate-900 rounded p-4 font-mono text-sm text-slate-300 mb-4 overflow-x-auto">
                          Headers: { "Authorization": "Bearer jwt-token..." }
                      </div>
                  </div>

              </div>
          </main>

          <!-- AI Prompt Modal -->
          <div id="promptModal" class="fixed inset-0 z-50 items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div class="modal-content glass max-w-3xl w-full rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                  <div class="flex justify-between items-center p-6 border-b border-slate-700">
                      <h3 class="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 text-gradient">AI Implementation Prompt</h3>
                      <button onclick="document.getElementById('promptModal').classList.remove('active')" class="text-slate-400 hover:text-white transition">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                  </div>
                  <div class="p-6 overflow-y-auto flex-grow bg-slate-900/50">
                      <p class="text-sm text-slate-400 mb-4">Paste this prompt into Claude, Gemini, ChatGPT, or Cursor to instantly generate your frontend auth flow!</p>
                      <div class="relative group">
                          <textarea id="promptText" readonly class="w-full h-64 bg-slate-900 text-slate-300 font-mono text-sm p-4 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 resize-none">${aiPrompt}</textarea>
                      </div>
                  </div>
                  <div class="p-6 border-t border-slate-700 flex justify-end gap-4">
                      <button onclick="document.getElementById('promptModal').classList.remove('active')" class="px-6 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition">Close</button>
                      <button onclick="copyPrompt()" id="copyBtn" class="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition flex items-center gap-2">
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
                  btn.classList.add('bg-green-600', 'hover:bg-green-500');
                  btn.classList.remove('bg-purple-600', 'hover:bg-purple-500');
                  
                  setTimeout(() => {
                      btn.innerHTML = originalHtml;
                      btn.classList.remove('bg-green-600', 'hover:bg-green-500');
                      btn.classList.add('bg-purple-600', 'hover:bg-purple-500');
                  }, 2000);
              }
          </script>
      </body>
      </html>
    `;
    res.type('text/html').send(html);
  }
}

