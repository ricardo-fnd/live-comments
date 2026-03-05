import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function setup() {
  const databaseUrl = process.env.LIVE_COMMENTS_DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ LIVE_COMMENTS_DATABASE_URL environment variable is required.')
    console.error('   Set it in your .env file or export it:')
    console.error('   export DATABASE_URL=postgres://user:pass@host/db')
    process.exit(1)
  }

  console.log('🔄 Running live-comments database migration...')

  const client = new pg.Client({ connectionString: databaseUrl })

  try {
    await client.connect()

    // Run all migrations in order
    const migrationFiles = ['001_initial.sql', '002_add_site_id.sql']
    for (const file of migrationFiles) {
      let sql: string
      try {
        sql = readFileSync(join(__dirname, '..', 'src', 'migrations', file), 'utf-8')
      } catch {
        sql = readFileSync(join(__dirname, '..', '..', 'src', 'migrations', file), 'utf-8')
      }
      await client.query(sql)
    }
    console.log('✅ Migration complete! live_comments table is ready.')
  } catch (err) {
    console.error('❌ Migration failed:', (err as Error).message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

const command = process.argv[2]

if (command === 'setup') {
  // Load env files from consumer's project (same priority as Next.js)
  const envFiles = ['.env.local', '.env']
  for (const file of envFiles) {
    try {
      const envContent = readFileSync(join(process.cwd(), file), 'utf-8')
      for (const line of envContent.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIndex = trimmed.indexOf('=')
        if (eqIndex === -1) continue
        const key = trimmed.slice(0, eqIndex).trim()
        const value = trimmed.slice(eqIndex + 1).trim()
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    } catch {
      // file not found, that's ok
    }
  }

  setup()
} else {
  console.log('live-comments CLI')
  console.log('')
  console.log('Usage:')
  console.log('  npx live-comments setup    Run database migration')
  process.exit(0)
}
