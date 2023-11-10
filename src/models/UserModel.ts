import { RegisterDtoType } from '../modules/auth/auth.types'
import { pgdb } from '../index'
import { IUser } from '../@types'

class UserModel {
  public static async create({ login, email, password }: Omit<RegisterDtoType, 'confirm'>) {
    const query = 'INSERT INTO "users" ("login", "email", "password") VALUES ($1, $2, $3);'
    await pgdb.none(query, [login, email, password])
  }

  // TODO: Проверить результат
  public static async getCountByLogin(login: string): Promise<number> {
    const query = 'SELECT COUNT(*) FROM "users" WHERE "login" = ?'
    return await pgdb.one<number>(query, login)
  }

  public static async updatePassword(userId: number, hashPassword: string) {
    const query = 'UPDATE users SET "password" = $1 WHERE "id" = $2'
    await pgdb.none(query, [hashPassword, userId])
  }

  public static async load(id: number) {
    const query = 'SELECT * FROM "users" WHERE "id" = $1'
    return (await pgdb.oneOrNone<IUser>(query, id))
  }

  public static async findByLogin(login: string) {
    const query = 'SELECT * FROM "users" WHERE "login" = $1 LIMIT 1'
    return await pgdb.oneOrNone<IUser>(query, login)
  }
}

export default UserModel
