import { pgdb } from '../index'
import { ITable } from './types'

class TableModel {
  public async findAll(userId: number): Promise<ITable[]> {
    const fields = '`id`, `name`, `password`, `count`, `created`, `user_id` as \'userId\''
    const query = 'SELECT ' + fields + ' FROM `tables` WHERE `user_id` = ?'
    const data = await pgdb.manyOrNone<ITable>(query, userId)

    return data as ITable[]
  }
}

export default TableModel
