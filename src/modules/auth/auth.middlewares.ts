import checkContentType from '../../middlewares/checkContentType'
import { celebrate } from 'celebrate'
import { accessScheme, loginSchema, registerSchema, restoreSchema } from './auth.scheme'

export const checkIsJson = checkContentType('application/json', true)

export const validateAccess = celebrate({ query: accessScheme })
export const validateRegister = celebrate({ body: registerSchema })
export const validateLogin = celebrate({ body: loginSchema })
export const validateRestore = celebrate({ body: restoreSchema })
