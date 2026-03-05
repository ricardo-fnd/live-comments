'use server'

import { query } from '../lib/db.js'
import { isAdminSession } from '../lib/session.js'

function getSiteId(): string {
  return process.env.LIVE_COMMENTS_SITE_ID || 'default'
}

export interface Comment {
  id: string
  site_id: string
  page_path: string
  css_selector: string | null
  pin_x_pct: number | null
  pin_y_pct: number | null
  author_name: string
  body: string
  status: 'open' | 'resolved'
  created_at: string
  resolved_at: string | null
}

const SELECT_FIELDS = 'id, site_id, page_path, css_selector, pin_x_pct, pin_y_pct, author_name, body, status, created_at, resolved_at'

export async function getComments(pagePath: string): Promise<Comment[]> {
  const result = await query<Comment>(
    `SELECT ${SELECT_FIELDS}
     FROM live_comments
     WHERE site_id = $1 AND page_path = $2 AND deleted_at IS NULL
     ORDER BY created_at ASC`,
    [getSiteId(), pagePath]
  )
  return result.rows
}

export async function getAllComments(): Promise<Record<string, Comment[]>> {
  const result = await query<Comment>(
    `SELECT ${SELECT_FIELDS}
     FROM live_comments
     WHERE site_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [getSiteId()]
  )

  const grouped: Record<string, Comment[]> = {}
  for (const row of result.rows) {
    if (!grouped[row.page_path]) grouped[row.page_path] = []
    grouped[row.page_path].push(row)
  }
  return grouped
}

export async function createComment(data: {
  pagePath: string
  cssSelector?: string | null
  pinXPct?: number | null
  pinYPct?: number | null
  authorName: string
  body: string
}): Promise<Comment> {
  const result = await query<Comment>(
    `INSERT INTO live_comments (site_id, page_path, css_selector, pin_x_pct, pin_y_pct, author_name, body)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${SELECT_FIELDS}`,
    [
      getSiteId(),
      data.pagePath,
      data.cssSelector ?? null,
      data.pinXPct ?? null,
      data.pinYPct ?? null,
      data.authorName,
      data.body,
    ]
  )
  return result.rows[0]
}

export async function resolveComment(id: string): Promise<Comment | null> {
  const isAdmin = await isAdminSession()
  if (!isAdmin) throw new Error('Unauthorized')

  const result = await query<Comment>(
    `UPDATE live_comments
     SET status = 'resolved', resolved_at = now()
     WHERE id = $1 AND site_id = $2 AND deleted_at IS NULL
     RETURNING ${SELECT_FIELDS}`,
    [id, getSiteId()]
  )
  return result.rows[0] ?? null
}

export async function deleteComment(id: string): Promise<boolean> {
  const isAdmin = await isAdminSession()
  if (!isAdmin) throw new Error('Unauthorized')

  const result = await query(
    `UPDATE live_comments SET deleted_at = now() WHERE id = $1 AND site_id = $2 AND deleted_at IS NULL`,
    [id, getSiteId()]
  )
  return (result.rowCount ?? 0) > 0
}
