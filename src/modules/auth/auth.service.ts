import { RegisterDtoType } from './auth.types'
import bcrypt from 'bcrypt'
import ApiError from '../../utils/errors/ApiError'
import UserModel from '../../models/UserModel'
import JwtService from '../../services/JwtService'
import EmailService from '../../services/EmailService'
import jsonwebtoken from 'jsonwebtoken'

interface SetPasswordDto {
  password: string;
  token: string
}

interface IRestorePayload {
  id: number,
  login: string
}

class AuthService {
  public static async createUser(body: RegisterDtoType): Promise<void> {
    const model = new UserModel()
    const count = await model.getCountByLogin(body.login)

    if (!count) {
      model.closeConnection()

      const error = 'Пользователь с таким логином уже существует'
      throw new ApiError(400, error, { fields: ['login'] })
    }

    const password = await bcrypt.hash(body.password, 10)
    await model.create({ login: body.login, email: body.email, password })

    model.closeConnection()
  }

  public static async authorization(body: { login: string, password: string }) {
    const model = new UserModel()
    const user = await model.findOne('login', body.login)

    model.closeConnection()

    if (!user) {
      const error = 'Пользователь с таким логином не найден'
      throw new ApiError(400, error, { fields: ['login'] })
    }

    const verify = await bcrypt.compare(body.password, user.password)

    if (!verify) {
      const error = 'Введен не верный пароль'
      throw new ApiError(400, error, { fields: ['password'] })
    }

    const { id, login, email } = user
    const userDto = { id, login, email }

    return {
      jwt: JwtService.sign(userDto),
      user: userDto
    }
  }

  public static async restoreAccess(login: string) {
    const model = new UserModel()
    const user = await model.findOne('login', login)

    model.closeConnection()

    if (!user) {
      const error = 'Пользователь с таким логином не найден!'
      throw new ApiError(400, error, { fields: ['login'] })
    }

    if (!user.email) {
      const error = 'Не установлена почта для отправки сообщения!'
      throw new ApiError(400, error)
    }

    if (!user.activated) {
      const error = 'Вы не подтвердили свою почту, восстановление не возможно!'
      throw new ApiError(400, error)
    }

    // ********** JWT ********** //

    const secret = AuthService.getRestoreSecret()

    if (secret === false) {
      const error = 'На сервере произошла ошибка!'
      throw new ApiError(500, error)
    }

    const payload: IRestorePayload = {
      id: +user.id,
      login: user.login
    }

    const params = { expiresIn: '10m' }
    const token = jsonwebtoken.sign(payload, secret, params)
    const link = `http://localhost:3000/restore?token=${token}`

    // ********** Mail ********** //

    let body = ''

    body += 'Кто то начал процесс восстановления доступа к аккаунту на сайте'
    body += ', если это не вы проигнорируйте это сообщение.\r\n'
    body += `Для восстановления доступа перейдите по ссылке: ${link}\r\n`
    body += `Ссылка будет доступна только в течении 10 минут.`

    const result = await EmailService.sendMail({
      to: user.email,
      subject: 'Восстановление доступа на сайте WorkingHours',
      text: body,
    })

    if (!result) {
      const error = 'Не удалось отправить сообщение на почту!'
      throw new ApiError(500, error)
    }
  }

  public static async changePassword(body: SetPasswordDto) {
    const secret = AuthService.getRestoreSecret()

    if (secret === false) {
      const error = 'На сервере произошла ошибка!'
      throw new ApiError(500, error)
    }

    let payload: IRestorePayload

    try {
      payload = jsonwebtoken.verify(body.token, secret) as IRestorePayload
    } catch (e) {
      const error = 'Срок действия ссылки уже истек или она не валидна!'
      throw new ApiError(400, error)
    }

    const password = await bcrypt.hash(body.password, 10)

    const model = new UserModel()
    await model.updatePassword(payload.id, password)
    model.closeConnection()
  }

  // ************* Private methods ************* //

  private static getRestoreSecret() {
    const secret = process?.env?.['JWT_RESTORE_SECRET']

    if (!secret) {
      console.error('Не хватает данных в ENV окружении!')
      return false
    }

    return secret
  }
}

export default AuthService