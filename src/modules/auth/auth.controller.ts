import { NextFunction, Request, Response } from "express"
import Validator from "../../utils/Validator"
import AuthService from "./auth.service"
import { RequestWithUser, extractToken } from "../../middlewares/checkAuth"
import { defaultError } from "../../utils/errors"
import ApiError from "../../utils/errors/ApiError"
import UserModel from "../../models/UserModel"

class AuthController {
  public static async logoutUser(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const token = extractToken(req)!
      await UserModel.removeAuthToken(req.user!.id, token)
      return res.end()
    } catch (err) {
      return next(err)
    }
  }

  public static async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!Validator.testLogin(req.body.login)) {
        const msg = "Введен не валидный логин"
        return defaultError(res, new ApiError(msg, 400, { fields: ["login"] }))
      }

      if (!Validator.testEmail(req.body.email)) {
        const msg = "Введен не валидный email"
        return defaultError(res, new ApiError(msg, 400, { fields: ["email"] }))
      }

      const testPassword = Validator.testPassword(req.body.password)

      if (!testPassword.status) {
        const err = { msg: testPassword.error, data: { fields: ["password"] } }
        return defaultError(res, new ApiError(err.msg, 400, err.data))
      }

      if (req.body.password !== req.body.confirm) {
        const msg = "Пароль не совпадает с его подтверждением"
        return defaultError(res, new ApiError(msg, 400, { fields: ["confirm"] }))
      }

      // *************** Конец валидации данных *************** //

      await AuthService.createUser(req.body)

      return res.json({ message: "Пользователь был успешно зарегистрирован!" })
    } catch (err) {
      return next(err)
    }
  }

  public static async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (Validator.pattern.password.cyrillic.test(req.body.password)) {
        const msg = "Ошибка валидации поля"
        const err = "В введенном пароле присутствует кириллица"

        return defaultError(res, new ApiError(msg, 400, { message: err, fields: ["password"] }))
      }

      const data = await AuthService.authorization(req.body)

      return res.json({ message: "Запрос успешно выполнен!", ...data })
    } catch (err) {
      return next(err)
    }
  }

  public static async checkToken(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      return res.json({ message: "Авторизация действительна", user: req?.user })
    } catch (err) {
      return next(err)
    }
  }

  public static async restoreAccess(req: Request, res: Response, next: NextFunction) {
    try {
      const login = req.query?.["login"]

      if (!login) {
        const msg = "Ошибка! Не указан логин пользователя"
        return defaultError(res, new ApiError(msg, 400, { fields: ["login"] }))
      }

      if (!Validator.testLogin(String(login))) {
        const msg = "Введен не валидный логин"
        return defaultError(res, new ApiError(msg, 400, { fields: ["login"] }))
      }

      await AuthService.restoreAccess(String(login))

      const message = "Ссылка для восстановления пароля отправлена на вашу почту!"

      return res.json({ message })
    } catch (err) {
      return next(err)
    }
  }

  public static async setPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { password, confirm } = req.body
      const token = extractToken(req)

      if (!token) {
        const msg = "Не указан access токен для совершения операции!"
        return defaultError(res, new ApiError(msg, 400))
      }

      const testPassword = Validator.testPassword(password)

      if (!testPassword.status) {
        const err = { msg: testPassword.error, data: { fields: ["password"] } }
        return defaultError(res, new ApiError(err.msg, 400, err.data))
      }

      if (password !== confirm) {
        const msg = "Пароль не совпадает с его подтверждением"
        return defaultError(res, new ApiError(msg, 400, { fields: ["confirm"] }))
      }

      await AuthService.changePassword({ token, password })

      return res.json({ message: "Пароль был успешно изменен" })
    } catch (err) {
      return next(err)
    }
  }
}

export default AuthController
