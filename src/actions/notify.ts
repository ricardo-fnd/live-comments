'use server'

import { sendEmail } from '../lib/email.js'

export async function notifyOwner(data: {
  pagePath: string
  authorName: string
  body: string
  commentId: string
}): Promise<{ success: boolean; error?: string }> {
  const notifyEmail = process.env.LIVE_COMMENTS_NOTIFY_EMAIL
  if (!notifyEmail) {
    return { success: false, error: 'LIVE_COMMENTS_NOTIFY_EMAIL not configured' }
  }

  try {
    const siteName = data.pagePath
    const author = data.authorName.replace(/</g, '&lt;').replace(/>/g, '&gt;')

    await sendEmail({
      to: notifyEmail,
      subject: `[live-comments] ${author} adicionou comentários em ${siteName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <p><strong>${author}</strong> adicionou comentários ao website <a href="${siteName}">${siteName}</a>.</p>
          <p style="color: #6b7280;">Faça login como admin para ver e gerir os comentários.</p>
        </div>
      `,
    })
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}
