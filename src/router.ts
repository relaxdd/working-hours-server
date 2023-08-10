import { json, Router } from 'express'
import authRouter from './modules/auth/auth.routes'
import cors from './middlewares/cors'
import testRouter from './modules/test/test.routes'

const router = Router()

router.use(json())
router.use(cors({ origin: 'http://localhost:3000' }))

router.use('/auth', authRouter)
router.use('/testing', testRouter)
// router.use('/post', tableRouter)

export default router