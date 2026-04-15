import "./env"
import express from "express"
import cors from "cors"
import requestRoute from "./routes/request"
import verifyRoute from "./routes/verify"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (_, res) => {
  res.send("API OK 🚀")
})

app.use("/request-email-change", requestRoute)
app.use("/verify-email-change", verifyRoute)

app.listen(3000, "0.0.0.0", () => {
  console.log("🚀 API RUNNING http://localhost:3000")
})