import { Router } from 'express'
import authController from './auth.controller'
import checkAuth from '../../middlewares/checkAuth'
import { checkIsJson, validateAccess, validateLogin, validateRegister, validateRestore } from './auth.middlewares'

const authRouter = Router()

authRouter.get('/validate', checkAuth, authController.validateToken)
authRouter.get('/restore', validateAccess, authController.restoreAccess)

authRouter.post('/signup', checkIsJson, validateRegister, authController.registerUser)
authRouter.post('/signin', checkIsJson, validateLogin, authController.loginUser)
authRouter.post('/password', checkIsJson, validateRestore, authController.setPassword)

export default authRouter
