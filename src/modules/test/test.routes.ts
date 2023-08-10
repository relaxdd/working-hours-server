import { Router } from 'express'
import checkAuth from '../../middlewares/checkAuth'

const testRouter = Router()

testRouter.get('/access', checkAuth, (_, res) => {
  return res.json({ message: 'Ваша авторизация действительна!' })
})

export default testRouter