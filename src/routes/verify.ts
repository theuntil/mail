import { Router } from "express"
import { supabase } from "../supabase"

const router = Router()

router.post("/", async (req, res) => {
  try {
    const { userId, code } = req.body

    const { data, error } = await supabase
      .from("email_change_requests")
      .select("*")
      .eq("user_id", userId)
      .eq("code", code)
      .single()

    if (!data || error) {
      return res.status(400).send("Kod yanlış")
    }

    if (new Date(data.expires_at) < new Date()) {
      return res.status(400).send("Kod süresi doldu")
    }

    // 🔥 CASE 1 → SADECE DOĞRULAMA
    if (data.is_verification) {
      await supabase
        .from("profiles")
        .update({ email_verified: true })
        .eq("id", userId)

      await supabase
        .from("email_change_requests")
        .delete()
        .eq("id", data.id)

      return res.send({ success: true, type: "verified" })
    }

    // 🔥 CASE 2 → EMAIL DEĞİŞTİRME
    const { error: updateError } =
      await supabase.auth.admin.updateUserById(userId, {
        email: data.new_email,
      })

    if (updateError) {
      return res.status(400).send("Email güncellenemedi")
    }

    await supabase
      .from("profiles")
      .update({
        email: data.new_email,
        email_verified: true,
      })
      .eq("id", userId)

    await supabase
      .from("email_change_requests")
      .delete()
      .eq("id", data.id)

    res.send({ success: true, type: "changed" })
  } catch (e) {
    console.log(e)
    res.status(500).send("Server error")
  }
})

export default router