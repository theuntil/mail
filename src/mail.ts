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
  await transporter.sendMail({
    from: config.emailFrom,
    to: email,
    subject: "Doğrulama Kodu",
    html: `<h2>${code}</h2><p>5 dakika geçerli</p>`,
  })
}