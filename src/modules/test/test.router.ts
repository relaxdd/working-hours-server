import { Router } from 'express'
import checkAuth from '../../middlewares/checkAuth'

const testRouter = Router()

testRouter.get('/access', checkAuth, (_, res, next) => {
  try {
    return res.json({ message: 'Ваша авторизация действительна' })
  } catch (err) {
    return next(err)
  }
})

export default testRouter
