import { Router } from "express"
import { join } from "path"

const rootRouter = Router()

rootRouter.get("(/*)?", (req, res) => {
  try {
    return res.sendFile(join(process.cwd(), "public", "index.html"))
  } catch (err) {
    console.log(err)
    return res.status(500).end()
  }
})

// rootRouter.all("*", (_, res) => res.status(404).end())

export default rootRouter
