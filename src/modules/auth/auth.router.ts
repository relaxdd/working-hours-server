import { Router } from 'express'
import AuthController from './auth.controller'
import checkContentType from '../../middlewares/checkContentType'
import validateJsonBody from '../../middlewares/validateJsonBody'
import { loginSchema, registerSchema, restoreSchema } from './auth.schemes'
import checkAuth from '../../middlewares/checkAuth'

const authRouter = Router()
const checkIsJson = checkContentType('application/json', true)

authRouter.get('/validate', checkAuth, AuthController.validateToken)
authRouter.get('/restore', AuthController.restoreAccess)

authRouter.post('/signup', checkIsJson, validateJsonBody(registerSchema), AuthController.registerUser)
authRouter.post('/signin', checkIsJson, validateJsonBody(loginSchema), AuthController.loginUser)
authRouter.post('/password', checkIsJson, validateJsonBody(restoreSchema), AuthController.setPassword)

export default authRouter
