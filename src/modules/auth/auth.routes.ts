import { Router } from 'express'
import AuthController from './auth.controller'
import checkContentType from '../../middlewares/checkContentType'
import validateJsonBody from '../../middlewares/validateJsonBody'
import { loginSchema, registerSchema } from './auth.schemes'

const authRouter = Router()
const checkIsJson = checkContentType('application/json', true)

authRouter.post('/signup', checkIsJson, validateJsonBody(registerSchema), AuthController.register)
authRouter.post('/signin', checkIsJson, validateJsonBody(loginSchema), AuthController.login)

export default authRouter
