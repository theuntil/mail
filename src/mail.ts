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

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">

        <!-- CARD -->
        <table width="100%" style="max-width:520px;margin-top:40px;">
          <tr>
            <td style="
              background:rgba(255,255,255,0.04);
              backdrop-filter: blur(20px);
              border-radius:28px;
              padding:32px;
              border:1px solid rgba(255,255,255,0.08);
            ">

              <!-- LOGO / TITLE -->
              <div style="text-align:center;margin-bottom:20px;">
                <div style="
                  width:56px;
                  height:56px;
                  margin:0 auto 16px;
                  border-radius:16px;
                  background:#3b86f7;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  color:white;
                  font-weight:bold;
                  font-size:20px;
                ">
                  K
                </div>

                <h1 style="
                  color:white;
                  margin:0;
                  font-size:22px;
                  font-weight:600;
                ">
                  Doğrulama Kodu
                </h1>

                <p style="
                  color:#9ca3af;
                  font-size:14px;
                  margin-top:8px;
                ">
                  Kodu uygulamaya girerek devam edin
                </p>
              </div>

              <!-- OTP -->
              <div style="
                text-align:center;
                margin:30px 0;
              ">
                <div style="
                  display:inline-block;
                  padding:18px 28px;
                  border-radius:18px;
                  background:rgba(255,255,255,0.06);
                  border:1px solid rgba(255,255,255,0.1);
                  font-size:34px;
                  letter-spacing:6px;
                  font-weight:700;
                  color:white;
                ">
                  ${code}
                </div>
              </div>

              <!-- INFO -->
              <p style="
                text-align:center;
                color:#9ca3af;
                font-size:13px;
                margin-bottom:30px;
              ">
                Bu kod 2 dakika geçerlidir.
              </p>

              <!-- BUTTON -->
              <div style="text-align:center;">
                <a href="${appLink}" style="
                  display:inline-block;
                  padding:14px 26px;
                  border-radius:999px;
                  background:#3b86f7;
                  color:white;
                  text-decoration:none;
                  font-weight:600;
                  font-size:14px;
                ">
                  Uygulamaya Git
                </a>
              </div>

              <!-- FALLBACK -->
              <p style="
                text-align:center;
                color:#6b7280;
                font-size:12px;
                margin-top:20px;
              ">
                Buton çalışmazsa:
                <br/>
                <a href="${fallback}" style="color:#3b86f7;text-decoration:none;">
                  ${fallback}
                </a>
              </p>

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