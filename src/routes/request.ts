import { Router } from "express"
import { supabase } from "../supabase"
import { sendOTP } from "../mail"

const router = Router()

const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString()

router.post("/", async (req, res) => {
  try {
    const { userId, newEmail } = req.body

    if (!userId || !newEmail) {
      return res.status(400).send("Eksik veri")
    }

    // 🔍 mevcut email
    const { data: user } = await supabase.auth.admin.getUserById(userId)

    const isSameEmail = user?.user?.email === newEmail

    const code = generateCode()

    const { error } = await supabase
      .from("email_change_requests")
      .insert({
        user_id: userId,
        new_email: newEmail,
        code,
        is_verification: isSameEmail, // 🔥 fark burada
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
      })

    if (error) return res.status(400).send(error.message)

    await sendOTP(newEmail, code)

    res.send({ success: true, type: isSameEmail ? "verify" : "change" })
  } catch (e) {
    console.log(e)
    res.status(500).send("Server error")
  }
})

export default router