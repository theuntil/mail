import { Router } from "express"
import { supabase } from "../supabase"
import { sendOTP } from "../mail"

const router = Router()

// 🔥 OTP
const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString()

// 🔥 EMAIL REGEX
const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

router.post("/", async (req, res) => {
  try {
    const { userId, newEmail } = req.body

    console.log("📩 EMAIL REQUEST:", { userId, newEmail })

    // =========================
    // 🔒 VALIDATION
    // =========================
    if (!userId || !newEmail) {
      console.log("❌ Eksik veri")
      return res.status(400).json({ error: "Eksik veri" })
    }

    const cleanEmail = newEmail.trim().toLowerCase()

    if (cleanEmail.length > 60) {
      console.log("❌ Email çok uzun")
      return res.status(400).json({ error: "Email max 60 karakter" })
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      console.log("❌ Email format hatalı:", cleanEmail)
      return res.status(400).json({ error: "Geçersiz email formatı" })
    }

    // =========================
    // 🔥 USER CHECK
    // =========================
    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(userId)

    if (userError || !userData?.user) {
      console.log("❌ Kullanıcı bulunamadı:", userError)
      return res.status(400).json({ error: "Kullanıcı bulunamadı" })
    }

    const currentEmail = userData.user.email
    const isSameEmail = currentEmail === cleanEmail

    console.log("👤 Current:", currentEmail)
    console.log("📧 New:", cleanEmail)
    console.log("🔁 Same:", isSameEmail)

    // =========================
    // 🔥 RATE LIMIT (GÜNLÜK 3)
    // =========================
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from("email_change_requests")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", todayStart.toISOString())

    if ((count || 0) >= 3) {
      console.log("🚫 Günlük limit aşıldı:", userId)
      return res.status(429).json({
        error: "Günlük email gönderim limitine ulaştınız (3)",
      })
    }

    // =========================
    // 🔥 EMAIL UNIQUE CHECK
    // =========================
    const { data: existsAuth } = await supabase
      .from("auth.users")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle()

    const { data: existsProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle()

    const emailExists =
      (!!existsAuth && existsAuth.id !== userId) ||
      (!!existsProfile && existsProfile.id !== userId)

    if (!isSameEmail && emailExists) {
      console.log("❌ Email başka kullanıcıya ait:", cleanEmail)
      return res.status(400).json({
        error: "Bu email başka kullanıcıya ait",
      })
    }

    // =========================
    // 🔥 OTP
    // =========================
    const code = generateCode()
    console.log("🔐 OTP:", code)

    // =========================
    // 🔥 INSERT
    // =========================
    const { error: insertError } = await supabase
      .from("email_change_requests")
      .insert({
        user_id: userId,
        new_email: cleanEmail,
        code,
        is_verification: isSameEmail,
        attempts: 0,
        expires_at: new Date(Date.now() + 2 * 60 * 1000), // 2 DK
      })

    if (insertError) {
      console.log("❌ DB ERROR:", insertError)

      if (insertError.code === "23514") {
        return res.status(400).json({
          error: "Email formatı veritabanı tarafından reddedildi",
        })
      }

      return res.status(400).json({
        error: "İstek oluşturulamadı",
      })
    }

    // =========================
    // 📧 MAIL
    // =========================
    try {
      await sendOTP(cleanEmail, code)
      console.log("📨 Mail gönderildi")
    } catch (mailError) {
      console.log("❌ MAIL ERROR:", mailError)

      return res.status(500).json({
        error: "Mail gönderilemedi",
      })
    }

    // =========================
    // ✅ SUCCESS
    // =========================
    return res.json({
      success: true,
      type: isSameEmail ? "verify" : "change",
      message: isSameEmail
        ? "Doğrulama kodu gönderildi"
        : "Email değiştirme kodu gönderildi",
    })

  } catch (e) {
    console.log("🔥 SERVER ERROR:", e)

    return res.status(500).json({
      error: "Sunucu hatası",
    })
  }
})

export default router