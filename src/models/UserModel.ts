import MySqlService from '../services/MySqlService'
import { RegisterDtoType } from '../modules/auth/auth.types'

export interface IUser {
  id: number,
  login: string,
  email: string,
  password: string,
  created: string,
}

class UserModel {
  private mysql: MySqlService

  public constructor() {
    this.mysql = new MySqlService()
  }

  public async create(obj: Omit<RegisterDtoType, 'confirm'>) {
    await this.mysql.connect()
    const query = 'INSERT INTO `users` (login, email, password) VALUES (?, ?, ?);'
    await this.mysql.query({ query, values: [obj.login, obj.email, obj.password] })
  }

  public async getCountByLogin(login: string): Promise<number> {
    await this.mysql.connect()

    const query = 'SELECT  COUNT(*) FROM `users` WHERE `login` = ?'
    const find = await this.mysql.query({ query, values: [login], })

    return (find as [{ 'COUNT(*)': number }])[0]['COUNT(*)']
  }

  public async findOne(field: 'email' | 'login', value: string) {
    if (!['email', 'login'].includes(field))
      throw new TypeError('Значение поля field не может быть таким!')

    await this.mysql.connect()

    const query = 'SELECT * FROM `users` WHERE `' + field + '` = ? LIMIT 1'
    return (await this.mysql.query({ query, values: [value] }) as IUser[])?.[0]
  }

  public closeConnection() {
    this.mysql.close()
  }
}

export default UserModel