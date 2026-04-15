import { Router } from "express"
import { supabase } from "../supabase"
import { sendOTP } from "../mail"

const router = Router()

// 🔥 OTP
const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString()

// 🔥 EMAIL REGEX (PRO)
const EMAIL_REGEX =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

router.post("/", async (req, res) => {
  try {
    const { userId, newEmail } = req.body

    // =========================
    // 🔒 BASIC VALIDATION
    // =========================
    if (!userId || !newEmail) {
      return res.status(400).json({ error: "MISSING_DATA" })
    }

    const cleanEmail = newEmail.trim().toLowerCase()

    if (cleanEmail.length > 60) {
      return res.status(400).json({ error: "EMAIL_TOO_LONG" })
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ error: "INVALID_EMAIL" })
    }

    // =========================
    // 🔥 CURRENT USER
    // =========================
    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(userId)

    if (userError || !userData?.user) {
      return res.status(400).json({ error: "USER_NOT_FOUND" })
    }

    const currentEmail = userData.user.email

    const isSameEmail = currentEmail === cleanEmail

    // =========================
    // 🔥 GLOBAL EMAIL CHECK
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
      return res.status(400).json({
        error: "EMAIL_ALREADY_EXISTS",
      })
    }

    // =========================
    // 🔥 OTP
    // =========================
    const code = generateCode()

    // =========================
    // 🔥 INSERT REQUEST (2 DK)
    // =========================
    const { error: insertError } = await supabase
      .from("email_change_requests")
      .insert({
        user_id: userId,
        new_email: cleanEmail,
        code,
        is_verification: isSameEmail,
        attempts: 0,
        expires_at: new Date(Date.now() + 2 * 60 * 1000), // ✅ 2 DK
      })

    if (insertError) {
      console.log("DB ERROR:", insertError)
      return res.status(400).json({
        error: "REQUEST_FAILED",
      })
    }

    // =========================
    // 📧 SEND MAIL
    // =========================
    await sendOTP(cleanEmail, code)

    // =========================
    // ✅ RESPONSE
    // =========================
    return res.json({
      success: true,
      type: isSameEmail ? "verify" : "change",
    })

  } catch (e) {
    console.log("REQUEST ERROR:", e)
    return res.status(500).json({
      error: "SERVER_ERROR",
    })
  }
})

export default router