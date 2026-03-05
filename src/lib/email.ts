import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const host = process.env.LIVE_COMMENTS_SMTP_HOST
    const port = process.env.LIVE_COMMENTS_SMTP_PORT
    const user = process.env.LIVE_COMMENTS_SMTP_USER
    const pass = process.env.LIVE_COMMENTS_SMTP_PASS

    if (!host || !port || !user || !pass) {
      throw new Error(
        'live-comments: SMTP env vars not set (LIVE_COMMENTS_SMTP_HOST, LIVE_COMMENTS_SMTP_PORT, LIVE_COMMENTS_SMTP_USER, LIVE_COMMENTS_SMTP_PASS)'
      )
    }

    transporter = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: parseInt(port, 10) === 465,
      auth: { user, pass },
    })
  }
  return transporter
}

export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
}): Promise<void> {
  const t = getTransporter()
  await t.sendMail({
    from: process.env.LIVE_COMMENTS_SMTP_USER,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  })
}
