import { RegisterDtoType } from '../modules/auth/auth.types'
import { pgdb } from '../index'
import { IUser } from './types'

class UserModel {
  public async create({ login, email, password }: Omit<RegisterDtoType, 'confirm'>) {
    const query = 'INSERT INTO public.users (login, email, password) VALUES ($1, $2, $3);'
    await pgdb.none(query, [login, email, password])
  }

  // TODO: Проверить результат
  public async getCountByLogin(login: string): Promise<number> {
    const query = 'SELECT COUNT(*) FROM public.users WHERE login = ?'
    const find = await pgdb.one(query, login)

    return (find as { 'COUNT(*)': number })['COUNT(*)']
  }

  public async updatePassword(userId: number, hashPassword: string) {
    const query = 'UPDATE public.users SET password = $1 WHERE id = $2'
    await pgdb.none(query, [hashPassword, userId])
  }

  public async load(id: number) {
    const query = 'SELECT * FROM public.users WHERE id = $1'
    return (await pgdb.oneOrNone<IUser>(query, id))
  }

  public async findOne(field: 'email' | 'login', value: string) {
    if (!['email', 'login'].includes(field))
      throw new TypeError('Значение поля field не может быть таким!')

    const query = 'SELECT * FROM public.users WHERE $1 = $2 LIMIT 1'
    return (await pgdb.manyOrNone<IUser>(query, [field, value]))?.[0] || null
  }
}

export default UserModel
