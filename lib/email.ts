import nodemailer from "nodemailer"

export function getMailer() {
  const host = process.env.EMAIL_HOST as string
  const port = parseInt(process.env.EMAIL_PORT || "587", 10)
  const user = process.env.EMAIL_USERNAME as string
  const pass = process.env.EMAIL_PASSWORD as string

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

export async function sendEmail(options: { to: string; subject: string; html: string }) {
  const transporter = getMailer()
  await transporter.sendMail({
    from: `HMS <${process.env.EMAIL_USERNAME}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  })
}


