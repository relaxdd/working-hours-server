import { Request, Response } from 'express'
import Validator from '../../utils/Validator'
import AuthService from './auth.service'
import ApiError from '../../utils/errors/ApiError'
import { defaultError } from '../../utils/errors'
import JwtService from '../../services/JwtService'
import { extractToken } from '../../middlewares/checkAuth'

class AuthController {
  public static async registerUser(req: Request, res: Response) {
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

  public static async loginUser(req: Request, res: Response) {
    if (Validator.pattern.password.cyrillic.test(req.body.password)) {
      const resp = {
        error: 'В введенном пароле присутствует кириллица',
        fields: ['password']
      }

      return res.status(400).json(resp)
    }

    try {
      const data = await AuthService.authorization(req.body)
      return res.json({ message: 'Запрос успешно выполнен!', ...data })
    } catch (e) {
      return defaultError(res, e as ApiError)
    }
  }

  public static validateToken(req: Request, res: Response) {
    const token = extractToken(req)!
    const user = JwtService.decode(token)

    return res.json({ message: 'Данные авторизации', user })
  }

  public static async restoreAccess(req: Request, res: Response) {
    const login = req.query?.['login']

    if (!login) {
      const error = 'Ошибка! Не указан логин пользователя'
      return res.status(400).json({ error })
    }

    if (!Validator.testLogin(String(login))) {
      const error = 'Введен не валидный логин'
      return res.status(400).json({ error, fields: ['login'] })
    }

    try {
      await AuthService.restoreAccess(String(login))

    } catch (e) {
      return defaultError(res, e as ApiError)
    }

    const message = 'Ссылка для восстановления пароля отправлена на вашу почту!'
    return res.json({ message })
  }

  public static async setPassword(req: Request, res: Response) {
    const { password, confirm } = req.body
    const token = extractToken(req)

    if (!token) {
      const error = 'Не указан access токен для совершения операции!'
      return res.status(400).json({ error })
    }

    const testPassword = Validator.testPassword(password)

    if (!testPassword.status) {
      const resp = { error: testPassword.error, fields: ['password'] }
      return res.status(400).json(resp)
    }

    if (password !== confirm) {
      const error = 'Пароль не совпадает с его подтверждением'
      return res.status(400).json({ error, fields: ['confirm'] })
    }

    try {
      await AuthService.changePassword({ token, password })
    } catch (e) {
      return defaultError(res, e as ApiError)
    }

    return res.json({ message: 'Пароль был успешно изменен' })
  }
}

export default AuthController