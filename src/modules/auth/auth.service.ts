import { RegisterDtoType } from './auth.types'
import bcrypt from 'bcrypt'
import ApiError from '../../utils/errors/ApiError'
import UserModel from '../../models/UserModel'
import JwtService from '../../services/JwtService'

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

  public static async authorization(body: { login: string, password: string }): Promise<string> {
    const model = new UserModel()
    const user = await model.findOne('login', body.login)

    if (!user) {
      const error = 'Пользователь с таким логином не найден'
      throw new ApiError(400, error, { field: ['login'] })
    }

    const verify = await bcrypt.compare(body.password, user.password)

    if (!verify) {
      const error = 'Вы ввели не верный пароль!'
      throw new ApiError(400, error, { fields: ['password'] })
    }

    const { id, login, email } = user

    return JwtService.sign({ id, login, email })
  }
}

export default AuthService