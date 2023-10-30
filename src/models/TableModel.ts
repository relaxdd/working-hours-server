import { pgdb } from '../index'
import { IEntity, IOptions, ITable, ITableRow } from './types'
import ApiError from '../utils/errors/ApiError'

class TableModel {
  public static async loadAllBound(tableId: number) {
    return await pgdb.task(async (t) => {
      const entities = await t.manyOrNone<IEntity>('SELECT * FROM entities WHERE table_id = $1', tableId)
      const options = await t.oneOrNone<IOptions>('SELECT * FROM options WHERE table_id = $1 LIMIT 1', tableId)
      const rows = await t.manyOrNone<ITableRow>('SELECT * FROM table_rows WHERE table_id = $1', tableId)

      return { entities, options, rows }
    })
  }

  public static async findAll(userId: number): Promise<ITable[]> {
    const query = 'SELECT * FROM tables WHERE user_id = $1'
    return await pgdb.manyOrNone<ITable>(query, userId)
  }

  public static async findOne(userId: number, tableId: number) {
    const query = 'SELECT *, user_id as "userId" FROM tables WHERE id = $1 AND user_id = $2'
    return await pgdb.oneOrNone<ITable>(query, [tableId, userId])
  }

  public static async setCount(userId: number, tableId: number, count: number) {
    const query = 'UPDATE tables SET count = $1 WHERE id = $2 AND user_id = $3'
    await pgdb.none(query, [count, tableId, userId])
  }

  public static async setName(userId: number, tableId: number, name: string) {
    const query = 'UPDATE tables SET name = $1 WHERE id = $2 AND user_id = $3'
    await pgdb.none(query, [name, tableId, userId])
  }

  public static async deleteOne(userId: number, tableId: number) {
    const query = 'SELECT user_id as "userId" FROM tables WHERE id = $1'
    const resId = await pgdb.oneOrNone<{ userId: number }>(query, tableId)

    if (!resId)
      throw new ApiError('Таблицы с таким ID не существует', 400)

    if (resId.userId !== userId)
      throw new ApiError('Вам не разрешено удалять эту таблицу', 403)

    await pgdb.task(async (t) => {
      await t.none('DELETE FROM table_rows WHERE table_id = $1', tableId)
      await t.none('DELETE FROM entities WHERE table_id = $1', tableId)
      await t.none('DELETE FROM options WHERE table_id = $1', tableId)
      await t.none('DELETE FROM tables WHERE id = $1 ', tableId)
    })
  }

  /**
   * @param userId Идентификатор пользователя
   * @param name Название таблицы
   * @return Идентификатор созданной таблицы
   */
  public static async createTable(userId: number, name: string): Promise<ITable> {
    const user = await pgdb.oneOrNone('SELECT * FROM users WHERE id = $1', userId)
    if (!user) throw new ApiError('Пользователя с таким ID не существует', 403)

    const find = await pgdb.oneOrNone<ITable>('SELECT * FROM tables WHERE name = $1', name)
    if (find) throw new ApiError('Таблица с таким именем уже существует', 400)

    return await pgdb.task(async (t) => {
      const query1 = 'INSERT INTO tables (name, user_id) VALUES ($1, $2) RETURNING *'
      const table = await t.oneOrNone<ITable>(query1, [name, userId])
      if (!table) throw new ApiError('Не удалось создать таблицу', 500)

      const query2 = 'INSERT INTO options (table_id) VALUES ($1) RETURNING id'
      const option = await t.oneOrNone<{ id: number }>(query2, table.id)
      if (!option) throw new ApiError('Не удалось создать опции таблицы', 500)

      const query3 = 'INSERT INTO entities ("key", "rate", "text", "option_id", "table_id") VALUES (\'base\', 250, \'Базовый\', $1, $2)'
      await t.none(query3, [option.id, table.id])

      return table
    })
  }
}

export default TableModel
