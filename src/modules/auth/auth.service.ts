import { IRestorePayload, RegisterDtoType, SetPasswordDto } from "./auth.types"
import bcryptjs from "bcryptjs"
import ApiError from "../../utils/errors/ApiError"
import UserModel from "../../models/UserModel"
import JwtService from "../../services/JwtService"
import EmailService from "../../services/EmailService"
import jwt from "jsonwebtoken"
import { CLIENT_HOST } from "../.."

class AuthService {
  public async createUser(body: RegisterDtoType): Promise<void> {
    const count = await UserModel.getCountByLogin(body.login)

    if (!count) {
      const error = "Пользователь с таким логином уже существует"
      throw new ApiError(error, 400, { fields: ["login"] })
    }

    const password = await bcryptjs.hash(body.password, 10)
    await UserModel.create({ login: body.login, email: body.email, password })
  }

  public async authorization(body: { login: string; password: string }) {
    const user = await UserModel.findByLogin(body.login)

    if (!user) {
      const error = "Пользователь с таким логином не найден"
      throw new ApiError(error, 400, { fields: ["login"] })
    }

    const verify = await bcryptjs.compare(body.password, user.password)

    if (!verify) {
      const error = "Введен не верный пароль"
      throw new ApiError(error, 400, { fields: ["password"] })
    }

    const { id, login, email } = user
    const userDto = { id, login, email }

    const jwt = JwtService.sign(userDto)
    await UserModel.saveAuthToken(id, jwt)

    return { jwt, user: userDto }
  }

  public async restoreAccess(login: string) {
    const user = await UserModel.findByLogin(login)

    if (!user) {
      const error = "Пользователь с таким логином не найден!"
      throw new ApiError(error, 400, { fields: ["login"] })
    }

    if (!user.email) {
      const error = "Не установлена почта для отправки сообщения!"
      throw new ApiError(error, 400)
    }

    if (!user.is_activated) {
      const error = "Вы не подтвердили свою почту, восстановление не возможно!"
      throw new ApiError(error, 400)
    }

    // ********** JWT ********** //

    const secret = this.getRestoreSecret()

    if (secret === false) {
      const error = "На сервере произошла ошибка!"
      throw new ApiError(error, 500)
    }

    const payload: IRestorePayload = {
      id: +user.id,
      login: user.login,
    }

    const params = { expiresIn: "10m" }
    const token = jwt.sign(payload, secret, params)
    const link = CLIENT_HOST + `/restore?token=${token}`

    // ********** Mail ********** //

    let body = ""

    body += "Кто то начал процесс восстановления доступа к аккаунту на сайте"
    body += ", если это не вы проигнорируйте это сообщение.\r\n"
    body += `Для восстановления доступа перейдите по ссылке: ${link}\r\n`
    body += `Ссылка будет доступна только в течении 10 минут.`

    const result = await EmailService.sendMail({
      to: user.email,
      subject: "Восстановление доступа на сайте WorkingHours",
      text: body,
    })

    if (!result) {
      const error = "Не удалось отправить сообщение на почту!"
      throw new ApiError(error, 500)
    }
  }

  public async changePassword(body: SetPasswordDto) {
    const secret = this.getRestoreSecret()

    if (secret === false) {
      const error = "На сервере произошла ошибка!"
      throw new ApiError(error, 500)
    }

    let payload: IRestorePayload

    try {
      payload = jwt.verify(body.token, secret) as IRestorePayload
    } catch (e) {
      const error = "Срок действия ссылки уже истек или она не валидна!"
      throw new ApiError(error, 400)
    }

    const password = await bcryptjs.hash(body.password, 10)
    await UserModel.updatePassword(payload.id, password)
  }

  // ************* Private methods ************* //

  private getRestoreSecret() {
    const secret = process?.env?.["JWT_RESTORE_SECRET"]

    if (!secret) {
      console.error("Не хватает данных в ENV окружении!")
      return false
    }

    return secret
  }
}

export default new AuthService()
