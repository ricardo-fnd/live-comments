# live-comments

Drop-in comment/pin widget for Next.js apps. Let external reviewers leave feedback on any page element — no account creation needed.

## Features

- **Page-level comments** — leave feedback on any page
- **Element pinning** — pin comments to specific DOM elements
- **Admin moderation** — resolve and delete comments (env-var auth)
- **Email notifications** — notify the site owner via SMTP
- **All-pages view** — see comments across all pages
- **Anonymous reviewers** — name-only, no sign-up required

## Setup

### 1. Install

```bash
npm install live-comments
```

### 2. Configure environment variables

```env
DATABASE_URL=postgres://user:pass@your-neon-db.neon.tech/dbname

# Admin credentials (for resolve/delete)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secret

# Email notifications (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=app-password
NOTIFY_EMAIL=owner@example.com
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

If you encounter bundling issues with `pg` or `nodemailer`, add:

```js
// next.config.js
module.exports = {
  serverExternalPackages: ['live-comments'],
}
```

## How It Works

1. A floating comment button appears in the bottom-right corner
2. Click it to open the comments panel or toggle pin mode
3. In **pin mode**, hover over elements to highlight them, click to attach a comment
4. Comments persist in your Postgres database
5. Admin can log in via the toolbar menu to resolve/delete comments
6. "Notify owner" sends an email to `NOTIFY_EMAIL`

## Tech Stack

- React client components (no external state library)
- Server actions for all data operations
- PostgreSQL via `pg`
- Nodemailer for email
- Tailwind CSS with `lc-` prefix (no style conflicts)

## License

MIT
