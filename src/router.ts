import { Router } from 'express'
import authRouter from './modules/auth/auth.router'
import testRouter from './modules/test/test.router'
import tableRouter from './modules/table/table.router'

const router = Router()

router.use('/auth', authRouter)
router.use('/testing', testRouter)
router.use('/table', tableRouter)

export default router