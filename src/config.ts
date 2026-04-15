
import path from "path"

export const config = {
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,

  smtpHost: process.env.SMTP_HOST!,
  smtpPort: Number(process.env.SMTP_PORT),
  smtpUser: process.env.SMTP_USER!,
  smtpPass: process.env.SMTP_PASS!,
  emailFrom: process.env.EMAIL_FROM!,
}