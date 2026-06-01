const fs = require('fs');

const endpoints = [
  {
    method: 'POST',
    path: '/auth/signup',
    color: 'green',
    title: 'Register User',
    description: 'Registers a new user and automatically sends an email verification link.',
    payload: '{ "email": "user@example.com", "password": "StrongPassword123!", "firstName": "John", "lastName": "Doe", "redirectUrl": "http://localhost:3000/verify" }',
    howTo: 'Use this endpoint when a user signs up. The `redirectUrl` is where the user will be redirected AFTER they click the verification link in their email.',
    codeExample: `fetch('http://localhost:4000/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'myPassword123',
    firstName: 'John',
    lastName: 'Doe',
    redirectUrl: 'http://localhost:3000/profile'
  })
}).then(res => res.json()).then(data => console.log(data));`
  },
  {
    method: 'POST',
    path: '/auth/login',
    color: 'green',
    title: 'User Login',
    description: 'Authenticates a user and returns a JWT (JSON Web Token) used to access protected routes.',
    payload: '{ "email": "user@example.com", "password": "StrongPassword123!" }',
    howTo: 'Call this when a user submits your login form. Save the returned token in localStorage or a cookie to use in subsequent requests.',
    codeExample: `fetch('http://localhost:4000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'myPassword123' })
}).then(res => res.json()).then(data => {
  // Save the token for future API calls!
  localStorage.setItem('token', data.access_token);
});`
  },
  {
    method: 'GET',
    path: '/users/me',
    color: 'blue',
    title: 'Get Current User Profile',
    description: 'Retrieves the profile of the currently logged-in user using their JWT token.',
    payload: 'Headers: { "Authorization": "Bearer <YOUR_JWT_TOKEN>" }',
    howTo: 'Use this on page load (e.g., your dashboard) to fetch the user\\'s data and display their name, email, avatar, etc. You MUST pass the token in the headers.',
    codeExample: `const token = localStorage.getItem('token');
fetch('http://localhost:4000/users/me', {
  method: 'GET',
  headers: { 'Authorization': \`Bearer \${token}\` }
}).then(res => res.json()).then(user => console.log('Logged in as:', user.email));`
  },
  {
    method: 'PATCH',
    path: '/users/me',
    color: 'orange',
    title: 'Update User Metadata',
    description: 'Allows you to save custom preferences or extra data (like theme, settings) to the user\\'s profile. It MERGES your new data with the existing data.',
    payload: '{ "metadata": { "theme": "dark", "newsletter": true } }',
    howTo: 'Use this when the user updates a setting in your app. Because it merges on the backend, you only need to send the fields you want to change.',
    codeExample: `const token = localStorage.getItem('token');
fetch('http://localhost:4000/users/me', {
  method: 'PATCH',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\` 
  },
  body: JSON.stringify({
    metadata: { theme: 'dark' } // Only updates the theme!
  })
}).then(res => res.json()).then(user => console.log('Updated user:', user));`
  },
  {
    method: 'POST',
    path: '/auth/forgot-password',
    color: 'green',
    title: 'Forgot Password',
    description: 'Sends a password reset email to the user with a special secure token.',
    payload: '{ "email": "user@example.com", "redirectUrl": "http://localhost:3000/reset-password" }',
    howTo: 'Call this when the user clicks "Forgot Password". The user will receive an email that redirects them to your frontend `redirectUrl` with a token attached in the URL (`?token=xyz`).',
    codeExample: `fetch('http://localhost:4000/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'user@example.com',
    redirectUrl: 'http://localhost:3000/update-password-page'
  })
});`
  },
  {
    method: 'POST',
    path: '/auth/update-password',
    color: 'green',
    title: 'Update Password',
    description: 'Updates the user\\'s password using the token they received from the forgot-password email.',
    payload: '{ "token": "<TOKEN_FROM_URL>", "newPassword": "NewStrongPassword123!" }',
    howTo: 'On your frontend reset password page, grab the `token` from the URL parameters (e.g. using `new URLSearchParams(window.location.search)`), ask the user for a new password, and send both here.',
    codeExample: `// Assume URL is http://localhost:3000/update-password-page?token=abc123xyz
const urlParams = new URLSearchParams(window.location.search);
const tokenFromUrl = urlParams.get('token');

fetch('http://localhost:4000/auth/update-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    token: tokenFromUrl,
    newPassword: 'MyBrandNewPassword99!'
  })
}).then(() => alert('Password updated! You can now log in.'));`
  },
  {
    method: 'POST',
    path: '/users/avatar',
    color: 'green',
    title: 'Upload Avatar Image',
    description: 'Uploads a profile picture for the user. It is automatically compressed to WebP and saved in cloud storage.',
    payload: 'multipart/form-data with a "file" field. Headers MUST include Authorization Bearer token.',
    howTo: 'Use a standard HTML file input. Instead of sending JSON, you must send a `FormData` object containing the file.',
    codeExample: `const token = localStorage.getItem('token');
const fileInput = document.querySelector('#avatarInput');
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:4000/users/avatar', {
  method: 'POST',
  headers: { 'Authorization': \`Bearer \${token}\` },
  body: formData // Note: Do NOT set Content-Type for FormData! fetch does it automatically.
}).then(res => res.json()).then(user => console.log('New Avatar URL:', user.avatarUrl));`
  }
];

let htmlContent = '';
endpoints.forEach(ep => {
  const colorMap = {
    green: 'text-green-400 bg-green-500/20 border-l-sky-500',
    blue: 'text-blue-400 bg-blue-500/20 border-l-blue-500',
    orange: 'text-orange-400 bg-orange-500/20 border-l-orange-500'
  };
  
  htmlContent += `
                  <div class="glass p-6 rounded-xl border-l-4 ${colorMap[ep.color].split(' ')[2]} mb-8 hover:bg-slate-800/50 transition">
                      <div class="flex items-center gap-4 mb-3">
                          <span class="${colorMap[ep.color].split(' ').slice(0,2).join(' ')} px-3 py-1 rounded font-mono text-sm font-bold shadow-sm">${ep.method}</span>
                          <h2 class="text-2xl font-bold font-mono text-white">${ep.path}</h2>
                      </div>
                      <h3 class="text-lg font-semibold text-sky-300 mb-2">${ep.title}</h3>
                      <p class="text-slate-300 mb-4 leading-relaxed">${ep.description}</p>
                      
                      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                          <div>
                              <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Payload / Headers</h4>
                              <div class="bg-slate-900/80 rounded-lg p-4 font-mono text-sm text-green-300 mb-4 border border-slate-700 shadow-inner overflow-x-auto">
                                  ${ep.payload.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                              </div>
                              <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">How to Use (Beginner Guide)</h4>
                              <p class="text-sm text-slate-300 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 leading-relaxed">${ep.howTo}</p>
                          </div>
                          <div>
                              <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Example Code (Fetch)</h4>
                              <div class="bg-[#1e1e1e] rounded-lg p-4 font-mono text-xs text-blue-300 border border-slate-700 shadow-inner overflow-x-auto whitespace-pre-wrap"><code>${ep.codeExample.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></div>
                          </div>
                      </div>
                  </div>
`;
});

const getDocsTemplate = `  @Get('docs')
  getDocs(@Res() res: Response) {
    const aiPrompt = \`You are an expert AI coding assistant. The user wants to integrate authentication into their frontend application using the Auth-Pro microservice.
Base URL: \${process.env.API_URL || 'http://localhost:3000'}

Available Endpoints:
1. POST /auth/signup - Payload: { email, password, firstName, lastName, redirectUrl }
2. POST /auth/login - Payload: { email, password }
3. POST /auth/forgot-password - Payload: { email, redirectUrl }
4. POST /auth/update-password - Payload: { token, newPassword }
5. GET /auth/verify-email?token=...&redirectUrl=...
6. GET /auth/reset-password?token=...&redirectUrl=...
7. GET /users/me - Header: Authorization Bearer ...
8. PATCH /users/me - Payload: { metadata: { ... } }
9. POST /users/avatar - Payload: multipart form-data (file)
\`;

    const html = \`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Auth-Pro Documentation for Beginners</title>
          <link rel="icon" href="/favicon.ico">
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
          <style>
              body { font-family: 'Inter', sans-serif; background-color: #020617; color: #f8fafc; }
              code { font-family: 'Fira Code', monospace; }
              .glass { background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.05); }
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
      <body class="min-h-screen flex flex-col relative overflow-x-hidden">
          <!-- Background decoration -->
          <div class="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900 rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
          <div class="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900 rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
          
          <!-- Navbar -->
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

          <!-- Main Docs Content -->
          <main class="flex-grow max-w-6xl w-full mx-auto p-4 md:p-8 z-10 pb-20">
              <div class="text-center mb-16 mt-8">
                  <span class="bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-sm font-semibold border border-blue-500/20 tracking-wide uppercase">Beginner Friendly</span>
                  <h1 class="text-5xl font-extrabold mb-6 mt-6 tracking-tight">API <span class="bg-gradient-to-r from-sky-400 to-indigo-400 text-gradient">Documentation</span></h1>
                  <p class="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">Everything you need to know to integrate Auth-Pro into your application. Complete with explanations and ready-to-use JavaScript fetch examples.</p>
              </div>
              
              <div class="space-y-2">
\${htmlContent}
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
                      <p class="text-sm text-slate-300 mb-4 font-medium">Paste this prompt into your favorite AI (Claude, ChatGPT, etc.) to instantly generate your frontend auth flow!</p>
                      <div class="relative group">
                          <textarea id="promptText" readonly class="w-full h-64 bg-[#0a0f1c] text-green-400 font-mono text-sm p-5 rounded-xl border border-slate-700/50 focus:outline-none focus:border-purple-500/50 resize-none shadow-inner">\${aiPrompt}</textarea>
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
                  btn.classList.add('bg-green-500', 'hover:bg-green-400', 'shadow-green-500/20');
                  btn.classList.remove('bg-purple-600', 'hover:bg-purple-500', 'shadow-purple-500/20');
                  
                  setTimeout(() => {
                      btn.innerHTML = originalHtml;
                      btn.classList.remove('bg-green-500', 'hover:bg-green-400', 'shadow-green-500/20');
                      btn.classList.add('bg-purple-600', 'hover:bg-purple-500', 'shadow-purple-500/20');
                  }, 2000);
              }
          </script>
      </body>
      </html>
    \`;
    res.type('text/html').send(html);
  }`;

const fileContent = fs.readFileSync('src/app.controller.ts', 'utf-8');
const lines = fileContent.split('\\n');
const startIdx = lines.findIndex(l => l.includes('getDocs(@Res() res: Response) {')) - 1;
const endIdx = lines.length - 2;

const newFileContent = lines.slice(0, startIdx).join('\\n') + '\\n' + getDocsTemplate + '\\n}\\n';
fs.writeFileSync('src/app.controller.ts', newFileContent);
console.log('Successfully updated app.controller.ts!');
