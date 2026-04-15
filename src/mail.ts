import nodemailer from "nodemailer"
import { config } from "./config"

export const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: config.smtpPort === 465,
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
})

export const sendOTP = async (email: string, code: string) => {

  const appLink = "kays://"
  const fallback = "https://kays.app"

  const logo =
    "https://supabase.rovand.cloud/storage/v1/object/public/media/kays.png"

  const bg =
    "https://supabase.rovand.cloud/storage/v1/object/public/media/kays.png" // pattern olarak kullanıyoruz

  await transporter.sendMail({
    from: config.emailFrom,
    to: email,
    subject: "Doğrulama Kodu",
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>

<body style="
  margin:0;
  padding:0;
  background:#0b0b0c;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
">

  <!-- BACKGROUND WRAPPER -->
  <table width="100%" cellpadding="0" cellspacing="0"
    style="
      background:#0b0b0c;
      background-image:url('${bg}');
      background-size:120px;
      background-repeat:repeat;
      background-position:center;
    "
  >
    <tr>
      <td align="center">

        <!-- CARD -->
        <table width="100%" style="max-width:520px;margin:40px 0;">
          <tr>
            <td style="
              background:rgba(15,15,16,0.85);
              border-radius:28px;
              padding:32px;
              border:1px solid rgba(255,255,255,0.06);
              backdrop-filter: blur(16px);
            ">

              <!-- LOGO -->
              <div style="text-align:center;margin-bottom:18px;">
                <img 
                  src="${logo}" 
                  width="64"
                  height="64"
                  style="border-radius:16px;"
                />
              </div>

              <!-- TITLE -->
              <h1 style="
                text-align:center;
                color:white;
                margin:0;
                font-size:22px;
                font-weight:600;
              ">
                Doğrulama Kodu
              </h1>

              <p style="
                text-align:center;
                color:#9ca3af;
                font-size:14px;
                margin-top:8px;
              ">
                Devam etmek için kodu gir
              </p>

              <!-- OTP -->
              <div style="text-align:center;margin:34px 0;">
                <div style="
                  display:inline-block;
                  padding:20px 32px;
                  border-radius:20px;
                  background:rgba(255,255,255,0.06);
                  border:1px solid rgba(255,255,255,0.08);
                  font-size:38px;
                  letter-spacing:8px;
                  font-weight:700;
                  color:white;
                ">
                  ${code}
                </div>
              </div>

              <!-- INFO -->
              <p style="
                text-align:center;
                color:#6b7280;
                font-size:13px;
                margin-bottom:28px;
              ">
                Kod 2 dakika geçerlidir
              </p>

              <!-- BUTTON -->
              <div style="text-align:center;">
                <a href="${appLink}" style="
                  display:inline-block;
                  padding:14px 28px;
                  border-radius:999px;
                  background:#3b86f7;
                  color:white;
                  text-decoration:none;
                  font-weight:600;
                  font-size:14px;
                  box-shadow:0 6px 20px rgba(59,134,247,0.4);
                ">
                  Uygulamayı Aç
                </a>
              </div>

        
            

            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
    `,
  })
}