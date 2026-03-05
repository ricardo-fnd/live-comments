# live-comments

Drop-in comment widget for Next.js apps. Let clients and reviewers leave feedback directly on your pages — pinned to specific elements or as general notes. No account needed for reviewers, just a name.

## Features

- **Element pinning** — pin comments to any page element (images, text, buttons, etc.)
- **General comments** — leave page-level feedback
- **Visual pin indicators** — floating comment cards on pinned elements
- **Cross-page navigation** — click a comment to jump to the pinned element, even on other pages
- **Admin moderation** — resolve and delete comments (env-var auth)
- **Email notifications** — notify the site owner via SMTP when reviewers submit feedback
- **Multi-project support** — share one database across projects, scoped by site ID
- **Zero CSS conflicts** — fully styled with prefixed Tailwind
- **Portuguese (PT-PT) UI**

## Setup

### 1. Install

```bash
npm install live-comments
```

### 2. Configure environment variables

Add to your `.env.local`:

```env
# Database (required)
LIVE_COMMENTS_DATABASE_URL=postgres://user:pass@your-neon-db.neon.tech/dbname

# Site ID — use a unique value per project sharing the same database
LIVE_COMMENTS_SITE_ID=my-project

# Admin credentials (for resolve/delete)
LIVE_COMMENTS_ADMIN_USERNAME=admin
LIVE_COMMENTS_ADMIN_PASSWORD=secret

# Email notifications (optional)
LIVE_COMMENTS_SMTP_HOST=smtp.gmail.com
LIVE_COMMENTS_SMTP_PORT=587
LIVE_COMMENTS_SMTP_USER=you@gmail.com
LIVE_COMMENTS_SMTP_PASS=app-password
LIVE_COMMENTS_NOTIFY_EMAIL=owner@example.com
```

### 3. Run database migration

```bash
npx live-comments setup
```

### 4. Add to your layout

```tsx
// app/layout.tsx
import { LiveComments } from 'live-comments'
import 'live-comments/styles.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <LiveComments />
      </body>
    </html>
  )
}
```

### 5. Update next.config

```ts
// next.config.ts
const nextConfig = {
  serverExternalPackages: ["pg", "nodemailer"],
}

export default nextConfig
```

## How It Works

1. A floating comment button appears in the bottom-right corner
2. Click it to open the comments panel or toggle comment mode
3. In **comment mode**, hover over elements to highlight them, click to attach a comment
4. Comments persist in your Postgres database
5. Admin can log in via the toolbar menu to resolve/delete comments
6. "Submeter comentários" sends an email summary to `LIVE_COMMENTS_NOTIFY_EMAIL`

## Tech Stack

- React client components (no external state library)
- Server actions for all data operations
- PostgreSQL via `pg`
- Nodemailer for email
- Tailwind CSS with `lc-` prefix (no style conflicts)

## License

MIT
