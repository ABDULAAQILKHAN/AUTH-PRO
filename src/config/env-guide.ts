export type EnvVarStatus = 'configured' | 'missing' | 'default';

export type EnvGroupKey =
  | 'database'
  | 'auth'
  | 'storage'
  | 'email'
  | 'admin'
  | 'application';

export interface EnvVarDoc {
  key: string;
  label: string;
  group: EnvGroupKey;
  required: boolean;
  hasCodeFallback: boolean;
  defaultValue?: string;
  description: string;
  steps: string[];
  exampleLine: string;
}

export interface EnvGroupDoc {
  key: EnvGroupKey;
  title: string;
  icon: string;
  vars: string[];
}

export interface EnvVarResult extends EnvVarDoc {
  status: EnvVarStatus;
  isSet: boolean;
}

export const ENV_GROUPS: EnvGroupDoc[] = [
  {
    key: 'database',
    title: 'Database',
    icon: '🗄️',
    vars: ['DATABASE_URL', 'DIRECT_URL'],
  },
  {
    key: 'auth',
    title: 'Authentication (JWT)',
    icon: '🔐',
    vars: ['JWT_SECRET', 'JWT_EXPIRES_IN'],
  },
  {
    key: 'storage',
    title: 'File Storage (Cloudflare R2)',
    icon: '☁️',
    vars: [
      'R2_ACCOUNT_ID',
      'R2_ACCESS_KEY_ID',
      'R2_SECRET_ACCESS_KEY',
      'R2_BUCKET_NAME',
      'R2_PUBLIC_URL',
    ],
  },
  {
    key: 'email',
    title: 'Email (SMTP)',
    icon: '📧',
    vars: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'],
  },
  {
    key: 'admin',
    title: 'Admin Access',
    icon: '🛡️',
    vars: ['ADMIN_PASS'],
  },
  {
    key: 'application',
    title: 'Application Settings',
    icon: '⚙️',
    vars: ['PORT', 'PRODUCTION', 'API_URL', 'FRONTEND_URL'],
  },
];

export const ENV_VARS: EnvVarDoc[] = [
  // Database
  {
    key: 'DATABASE_URL',
    label: 'Pooled Database Connection URL',
    group: 'database',
    required: true,
    hasCodeFallback: false,
    description:
      'The pooled Postgres connection string Prisma uses for normal query traffic. Without it, every endpoint that touches the database will fail.',
    steps: [
      'Create a free project at neon.tech (or use any Postgres provider).',
      "Open your project dashboard and go to 'Connection Details'.",
      "Select the 'Pooled connection' string.",
      'Copy it and paste it as DATABASE_URL in your .env file.',
    ],
    exampleLine:
      'DATABASE_URL="postgresql://user:password@hostname/dbname?pgbouncer=true&connect_timeout=15"',
  },
  {
    key: 'DIRECT_URL',
    label: 'Direct Database Connection URL',
    group: 'database',
    required: true,
    hasCodeFallback: false,
    description:
      'The direct (non-pooled) Postgres connection string Prisma uses for migrations and schema pushes.',
    steps: [
      'On the same Neon dashboard Connection Details panel, switch to the "Direct connection" string.',
      'Copy it and paste it as DIRECT_URL in your .env file.',
      'Run `npx prisma generate && npx prisma db push` once both URLs are set.',
    ],
    exampleLine: 'DIRECT_URL="postgresql://user:password@hostname/dbname?connect_timeout=15"',
  },

  // Auth
  {
    key: 'JWT_SECRET',
    label: 'JWT Signing Secret',
    group: 'auth',
    required: true,
    hasCodeFallback: true,
    defaultValue: "'secret' (INSECURE — do not use in production)",
    description:
      'Signs and verifies session tokens. If left unset the app falls back to an insecure default so it keeps working locally, but this must be set before deploying.',
    steps: [
      'Run `openssl rand -base64 32` in your terminal (or generate any long random string).',
      'Copy the output.',
      'Paste it as JWT_SECRET in your .env file.',
    ],
    exampleLine: 'JWT_SECRET="your-super-secret-jwt-key"',
  },
  {
    key: 'JWT_EXPIRES_IN',
    label: 'JWT Expiry',
    group: 'auth',
    required: false,
    hasCodeFallback: true,
    defaultValue: '1d',
    description: 'How long issued tokens remain valid before the user has to log in again.',
    steps: [
      'Pick a duration string, e.g. "1h", "12h", "1d", or "7d".',
      'Set it only if the default 1-day expiry does not fit your use case.',
    ],
    exampleLine: 'JWT_EXPIRES_IN="1d"',
  },

  // Storage
  {
    key: 'R2_ACCOUNT_ID',
    label: 'Cloudflare Account ID',
    group: 'storage',
    required: false,
    hasCodeFallback: false,
    description:
      'Used to build the R2 API endpoint. Without the full R2_* group, avatar and media upload endpoints will fail — the rest of the app works fine.',
    steps: [
      'Sign up at dash.cloudflare.com and open the R2 section.',
      'Copy your Account ID from the R2 overview page sidebar.',
    ],
    exampleLine: 'R2_ACCOUNT_ID="your-cloudflare-account-id"',
  },
  {
    key: 'R2_ACCESS_KEY_ID',
    label: 'R2 Access Key ID',
    group: 'storage',
    required: false,
    hasCodeFallback: false,
    description: 'API credential used to authenticate uploads/deletes against your R2 bucket.',
    steps: [
      "Go to R2 → 'Manage R2 API Tokens' → 'Create API Token'.",
      'Grant it read/write permissions.',
      'Copy the generated Access Key ID.',
    ],
    exampleLine: 'R2_ACCESS_KEY_ID="your-r2-access-key-id"',
  },
  {
    key: 'R2_SECRET_ACCESS_KEY',
    label: 'R2 Secret Access Key',
    group: 'storage',
    required: false,
    hasCodeFallback: false,
    description: 'Secret paired with the Access Key ID — shown only once when the token is created.',
    steps: [
      'On the same API token creation screen, copy the Secret Access Key before leaving the page.',
      "If you lose it, create a new token — Cloudflare won't show it again.",
    ],
    exampleLine: 'R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"',
  },
  {
    key: 'R2_BUCKET_NAME',
    label: 'R2 Bucket Name',
    group: 'storage',
    required: false,
    hasCodeFallback: false,
    description: 'The bucket where uploaded files (avatars, media) are stored.',
    steps: [
      'In the R2 dashboard, click "Create bucket".',
      'Name it whatever you like — use that exact name here.',
    ],
    exampleLine: 'R2_BUCKET_NAME="your-r2-bucket-name"',
  },
  {
    key: 'R2_PUBLIC_URL',
    label: 'R2 Public Base URL',
    group: 'storage',
    required: false,
    hasCodeFallback: false,
    description: 'Base URL used to construct the public link returned after a file is uploaded.',
    steps: [
      "Enable public access on the bucket (or attach a custom domain) under the bucket's Settings.",
      'Copy the resulting public base URL (no trailing slash).',
    ],
    exampleLine: 'R2_PUBLIC_URL="https://your-r2-public-url.com"',
  },

  // Email
  {
    key: 'SMTP_HOST',
    label: 'SMTP Host',
    group: 'email',
    required: false,
    hasCodeFallback: false,
    description:
      'Mail server host used to send verification and password-reset emails. Without the full SMTP group, those emails fail to send — signup/login still work.',
    steps: [
      'Sign up with a transactional email provider (Resend, SendGrid, AWS SES, Mailgun, or even Gmail for testing).',
      'Copy the SMTP host they give you.',
    ],
    exampleLine: 'SMTP_HOST="smtp.example.com"',
  },
  {
    key: 'SMTP_PORT',
    label: 'SMTP Port',
    group: 'email',
    required: false,
    hasCodeFallback: true,
    defaultValue: '587',
    description: 'Mail server port — 587 for STARTTLS, 465 for implicit SSL/TLS.',
    steps: ['Use 587 unless your provider specifically tells you to use 465.'],
    exampleLine: 'SMTP_PORT="587"',
  },
  {
    key: 'SMTP_USER',
    label: 'SMTP Username',
    group: 'email',
    required: false,
    hasCodeFallback: false,
    description: 'Username used to authenticate with your mail provider (often an API key or full email address).',
    steps: ['Copy the SMTP username from your provider dashboard.'],
    exampleLine: 'SMTP_USER="your-smtp-username"',
  },
  {
    key: 'SMTP_PASS',
    label: 'SMTP Password',
    group: 'email',
    required: false,
    hasCodeFallback: false,
    description: 'Password or API key used to authenticate with your mail provider. For Gmail, generate an App Password instead of using your real password.',
    steps: ['Copy the SMTP password/API key from your provider dashboard.'],
    exampleLine: 'SMTP_PASS="your-smtp-password"',
  },
  {
    key: 'SMTP_FROM',
    label: 'SMTP From Address',
    group: 'email',
    required: false,
    hasCodeFallback: true,
    defaultValue: '"Auth-Pro" <noreply@example.com>',
    description: 'The "From" header shown on all outgoing mail.',
    steps: ['Set this to a sender name and address your provider allows you to send from.'],
    exampleLine: "SMTP_FROM='\"Auth-Pro\" <noreply@example.com>'",
  },

  // Admin
  {
    key: 'ADMIN_PASS',
    label: 'Admin Password',
    group: 'admin',
    required: false,
    hasCodeFallback: false,
    description:
      'Shared secret guarding admin-only endpoints (ban user, send custom mail). Missing it just keeps those endpoints locked (401) — nothing else is affected.',
    steps: [
      'Pick any strong password/string of your own choosing — no external service needed.',
      'Set it as ADMIN_PASS in your .env.',
      'Send that same value in the adminPass field when calling admin-only endpoints.',
    ],
    exampleLine: 'ADMIN_PASS="your-custom-password"',
  },

  // Application
  {
    key: 'PORT',
    label: 'Server Port',
    group: 'application',
    required: false,
    hasCodeFallback: true,
    defaultValue: '3000',
    description: 'Which port the HTTP server listens on.',
    steps: ['Set this only if 3000 is already in use or your host requires a specific port.'],
    exampleLine: 'PORT=3000',
  },
  {
    key: 'PRODUCTION',
    label: 'Production Flag',
    group: 'application',
    required: false,
    hasCodeFallback: true,
    defaultValue: 'false',
    description: 'Set to true in real deployments — this disables the Swagger UI at /api.',
    steps: ['Leave as false for local development.', 'Set to true when deploying to a live server.'],
    exampleLine: 'PRODUCTION=false',
  },
  {
    key: 'API_URL',
    label: 'Base API URL',
    group: 'application',
    required: false,
    hasCodeFallback: true,
    defaultValue: 'http://localhost:3000',
    description: 'Base URL used to build absolute links in emails and redirects.',
    steps: ['Set this to your public deployment URL in production, e.g. https://api.yourdomain.com.'],
    exampleLine: 'API_URL=http://localhost:3000',
  },
  {
    key: 'FRONTEND_URL',
    label: 'Frontend Base URL',
    group: 'application',
    required: false,
    hasCodeFallback: true,
    defaultValue: '(falls back to API_URL, then http://localhost:3000)',
    description:
      'Alternate base URL for email links, used only if your frontend is hosted on a different domain than the API.',
    steps: ['Set this only if you want emails to point at a separate frontend domain instead of the API itself.'],
    exampleLine: 'FRONTEND_URL=http://localhost:5173',
  },
];

/**
 * Only ever derives status from whether process.env[key] is set — never
 * returns or exposes the actual value, so secrets never reach the dashboard.
 */
export function getEnvStatus(key: string): EnvVarStatus {
  const doc = ENV_VARS.find((v) => v.key === key);
  const isSet = Boolean(process.env[key]);
  if (isSet) return 'configured';
  return doc?.hasCodeFallback ? 'default' : 'missing';
}

export function getAllEnvResults(): EnvVarResult[] {
  return ENV_VARS.map((doc) => ({
    ...doc,
    status: getEnvStatus(doc.key),
    isSet: Boolean(process.env[doc.key]),
  }));
}

export function getEnvSummary(): {
  total: number;
  configured: number;
  missing: number;
  usingDefault: number;
} {
  const results = getAllEnvResults();
  return {
    total: results.length,
    configured: results.filter((r) => r.status === 'configured').length,
    missing: results.filter((r) => r.status === 'missing').length,
    usingDefault: results.filter((r) => r.status === 'default').length,
  };
}
