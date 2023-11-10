import { Router } from "express"
import checkAuth from "../../middlewares/checkAuth"

const testRouter = Router()

testRouter.get("/access", checkAuth, (_, res) => {
  return res.json({ message: "Ваша авторизация действительна!" })
})

// testRouter.get("/db-error", async (req, res, next) => {
//   try {
//     const users = await pgdb.manyOrNone('SELECT * FROM "user"')
//     return res.json(users)
//   } catch (err) {
//     return next(err)
//   }
// })

export default testRouter
