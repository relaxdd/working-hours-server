import { Request, Response } from 'express'
import Validator from '../../utils/Validator'
import AuthService from './auth.service'
import ApiError from '../../utils/errors/ApiError'
import { defaultError } from '../../utils/errors'

// export const registerMap: Record<RegisterKeysType, string> = {
//   login: 'userLogin',
//   email: 'userEmail',
//   password: 'userPassword',
//   confirm: 'userConfirm'
// }

class AuthController {
  public static async register(req: Request, res: Response) {
    if (!Validator.testLogin(req.body.login)) {
      const error = 'Введен не валидный логин'
      return res.status(400).json({ error, fields: ['login'] })
    }

    if (!Validator.testEmail(req.body.email)) {
      const error = 'Введен не валидный email'
      return res.status(400).json({ error, fields: ['email'] })
    }

    const testPassword = Validator.testPassword(req.body.password)

    if (!testPassword.status) {
      const resp = { error: testPassword.error, fields: ['password'] }
      return res.status(400).json(resp)
    }

    if (req.body.password !== req.body.confirm) {
      const error = 'Пароль не совпадает с его подтверждением'
      return res.status(400).json({ error, fields: ['confirm'] })
    }

    // *************** Конец валидации данных *************** //

    try {
      await AuthService.createUser(req.body)
    } catch (e) {
      return defaultError(res, e as ApiError)
    }

    return res.json({ message: 'Пользователь был успешно зарегистрирован!' })
  }

  public static async login(req: Request, res: Response) {
    if (Validator.pattern.password.cyrillic.test(req.body.password)) {
      const resp = {
        error: 'В введенном пароле присутствует кириллица',
        fields: ['password']
      }

      return res.status(400).json(resp)
    }

    try {
      const jwt = await AuthService.authorization(req.body)
      return res.json({ message: 'Запрос успешно выполнен!', jwt })
    } catch (e) {
      return defaultError(res, e as ApiError)
    }
  }
}

export default AuthController