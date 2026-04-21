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
  const fallback = "https://kays.com.tr"

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
  background:#000; /* EKLENDİ */
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
">

  <!-- FULL BACKGROUND FIX -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000;">
    <tr>
      <td align="center">

        <!-- CARD -->
        <table width="100%" style="max-width:520px;margin-top:70px; margin-bottom:80px;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="
              background:rgba(255,255,255,0.04);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px); /* EKLENDİ (iOS Mail için) */
              border-radius:28px;
              padding:32px;
              border:1px solid rgba(255,255,255,0.08);
            ">

              <!-- LOGO / TITLE -->
              <div style="text-align:center;margin-bottom:20px;">
                <div style="text-align:center; margin-bottom:18px;">

                  <span style="
                    font-size:26px;
                    font-weight:700;
                    color:white;
                    letter-spacing:0.5px;
                  ">
                    Kays
                  </span>

                  <span style="
                    font-size:26px;
                    font-weight:300;
                    color:#9ca3af;
                  ">
                    Verify
                  </span>

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
