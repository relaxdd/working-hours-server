import { pgdb } from "../index"
import {
  IEntity,
  MaybeNewOrUpdatedEntity,
  IOptions,
  ITable,
  ITableRow,
  ImportTableRows,
  ImportOptions,
  ImportEntity,
  MaybeNewOrUpdatedTableRow,
} from "../@types"
import ApiError from "../utils/errors/ApiError"
import { DeleteEntities, UpdatePassword, UpdateTableRows } from "../modules/data/data.scheme"

type TImportTableRowsWithOptionsPayload = {
  tableId: number
  mergeEntities: "on" | undefined
  tableData: ImportTableRows[]
  optionsData: {
    options: ImportOptions
    entities: ImportEntity[]
  }
}

class TableModel {
  public static async loadAllBound(tableId: number) {
    return await pgdb.task(async (t) => {
      const entities = await t.manyOrNone<IEntity>(
        "SELECT * FROM entities WHERE table_id = $1",
        tableId
      )
      const options = await t.oneOrNone<IOptions>(
        "SELECT * FROM options WHERE table_id = $1 LIMIT 1",
        tableId
      )
      const rows = await t.manyOrNone<ITableRow>(
        "SELECT * FROM table_rows WHERE table_id = $1",
        tableId
      )

      return { entities, options, rows }
    })
  }

  public static async findAll(userId: number): Promise<ITable[]> {
    const query = "SELECT * FROM tables WHERE user_id = $1"
    return await pgdb.manyOrNone<ITable>(query, userId)
  }

  public static async findOne(userId: number, tableId: number) {
    const query = 'SELECT *, user_id as "userId" FROM tables WHERE id = $1 AND user_id = $2'
    return await pgdb.oneOrNone<ITable>(query, [tableId, userId])
  }

  public static async setCount(userId: number, tableId: number, count: number) {
    const query = "UPDATE tables SET count = $1 WHERE id = $2 AND user_id = $3"
    await pgdb.none(query, [count, tableId, userId])
  }

  public static async setName(userId: number, tableId: number, name: string) {
    const query = "UPDATE tables SET name = $1 WHERE id = $2 AND user_id = $3"
    await pgdb.none(query, [name, tableId, userId])
  }

  public static async deleteOne(userId: number, tableId: number) {
    const query = 'SELECT user_id as "userId" FROM tables WHERE id = $1'
    const resId = await pgdb.oneOrNone<{ userId: number }>(query, tableId)

    if (!resId) throw new ApiError("Таблицы с таким ID не существует", 400)

    if (resId.userId !== userId) throw new ApiError("Вам не разрешено удалять эту таблицу", 403)

    await pgdb.task(async (t) => {
      await t.none("DELETE FROM table_rows WHERE table_id = $1", tableId)
      await t.none("DELETE FROM entities WHERE table_id = $1", tableId)
      await t.none("DELETE FROM options WHERE table_id = $1", tableId)
      await t.none("DELETE FROM tables WHERE id = $1 ", tableId)
    })
  }

  /**
   * @param userId Идентификатор пользователя
   * @param name Название таблицы
   * @return Идентификатор созданной таблицы
   */
  public static async createTable(userId: number, name: string): Promise<ITable> {
    const user = await pgdb.oneOrNone(`SELECT * FROM "users" WHERE "id" = $1`, userId)
    if (!user) throw new ApiError("Пользователя с таким ID не существует", 403)

    const find = await pgdb.oneOrNone<ITable>('SELECT * FROM tables WHERE "name" = $1', name)
    if (find) throw new ApiError("Таблица с таким именем уже существует", 400)

    return await pgdb.task(async (t) => {
      const query1 = 'INSERT INTO "tables" ("name", "user_id") VALUES ($1, $2) RETURNING *'
      const table = await t.oneOrNone<ITable>(query1, [name, userId])
      if (!table) throw new ApiError("Не удалось создать таблицу", 500)

      const query2 = 'INSERT INTO "options" ("table_id") VALUES ($1) RETURNING "id"'
      const option = await t.oneOrNone<{ id: number }>(query2, table.id)
      if (!option) throw new ApiError("Не удалось создать опции таблицы", 500)

      const query3 = `INSERT INTO "entities" ("key", "rate", "text", "option_id", "table_id") VALUES ('base', 250, 'Базовый', $1, $2)`
      await t.none(query3, [option.id, table.id])

      return table
    })
  }

  /**
   * TODO: Добавить проверку пользователя
   * @param entities
   */
  public static async updateEntities(entities: MaybeNewOrUpdatedEntity[]) {
    await pgdb.task(async (t) => {
      for (const { isCreated, isUpdated, ...entity } of entities) {
        if (!isCreated && !isUpdated) continue

        const query = isCreated
          ? 'INSERT INTO "entities" ("key", "rate", "text", "option_id", "table_id") VALUES ($1, $2, $3, $4, $5)'
          : 'UPDATE entities "SET" "key" = $1, "rate" = $2, "text" = $3 WHERE "option_id" = $4 AND "table_id" = $5 AND "id" = $6'
        const values = [entity.key, entity.rate, entity.text, entity.option_id, entity.table_id]

        if (!isCreated) values.push(entity.id)

        await t.none(query, values)
      }
    })
  }

  public static async updateOptions({
    type_adding,
    round_step,
    hidden_cols,
    using_keys,
    ...ids
  }: IOptions) {
    const query = `UPDATE "options" SET "type_adding" = $1, "round_step" = $2, "hidden_cols" = $3, "using_keys" = $4 WHERE "id" = $5 AND "table_id" = $6`

    const values = [
      type_adding,
      round_step,
      JSON.stringify(hidden_cols),
      JSON.stringify(using_keys),
      ids.id,
      ids.table_id,
    ]

    await pgdb.none(query, values)
  }

  // TODO: Переписать на слоты "WHERE 'id' IN (...)"
  public static async deleteEntities({ tableId, remove }: DeleteEntities) {
    await pgdb.task(async (t) => {
      for (const id of remove) {
        const query = 'DELETE FROM "entities" WHERE "id" = $1 AND "table_id" = $2'
        await t.none(query, [id, tableId])
      }
    })
  }

  public static async updatePassword({ tableId, password }: UpdatePassword) {
    const query = 'UPDATE "tables" SET "password" = $1 WHERE "id" = $2'
    await pgdb.none(query, [password, tableId])
  }

  public static async importTableRows(data: ImportTableRows[], tableId: number) {
    await pgdb.task(async (t) => {
      for (const row of data) {
        const query = `INSERT INTO "table_rows" ("start", "finish", "is_paid", "title", "description", "entity_id", "table_id")
         VALUES ($1, $2, $3, $4, $5, $6, $7);`

        await t.none(query, [
          row.start,
          row.finish,
          row.is_paid,
          row.title,
          row.description,
          row.entity_id,
          tableId,
        ])
      }

      const query = 'UPDATE "tables" SET "count" = $1 WHERE "id" = $2'
      await t.none(query, [data.length, tableId])
    })
  }

  public static async importTableRowsWithOptions({
    tableId,
    mergeEntities,
    tableData,
    optionsData: { options, entities },
  }: TImportTableRowsWithOptionsPayload) {
    await pgdb.task(async (t) => {
      if (!mergeEntities) {
        await t.none('DELETE FROM "entities" WHERE "table_id" = $1', [tableId])
      }

      await t.none(`DELETE FROM "table_rows" WHERE "table_id" = $1`, [tableId])

      const query = `UPDATE "options" SET "type_adding" = $1, "round_step" = $2, "hidden_cols" = $3, "using_keys" = $4 
      WHERE "table_id" = $5 RETURNING "id" "optionsId"`

      const { optionsId } = await t.one<{ optionsId: number }>(query, [
        options.type_adding,
        options.round_step,
        JSON.stringify(options.hidden_cols),
        JSON.stringify(options.using_keys),
        tableId,
      ])

      const entityIdAssoc: Record<"prev" | "next", number>[] = []

      for (const entity of entities) {
        const query = `INSERT INTO "entities" ("key", "rate", "text", "option_id", "table_id") 
          VALUES ($1, $2, $3, $4, $5) RETURNING "id" AS "entityId"`

        const { entityId } = await t.one<{ entityId: number }>(query, [
          entity.key,
          entity.rate,
          entity.text,
          optionsId,
          tableId,
        ])

        if (entity?.id !== undefined) {
          entityIdAssoc.push({ prev: entity.id, next: entityId })
        }
      }

      for (const row of tableData) {
        if (row.entity_id) {
          row.entity_id =
            entityIdAssoc.find((it) => {
              return it.prev === row.entity_id
            })?.next || null
        }

        const query = `INSERT INTO "table_rows" ("start", "finish", "is_paid", "title", "description", "entity_id", "table_id")
        VALUES ($1, $2, $3, $4, $5, $6, $7);`

        await t.none(query, [
          row.start,
          row.finish,
          row.is_paid,
          row.title,
          row.description,
          row.entity_id,
          tableId,
        ])
      }

      await t.none('UPDATE "tables" SET "count" = $1 WHERE "id" = $2', [tableData.length, tableId])
    })
  }

  public static async updateTableRows({
    tableId,
    tableRows,
    deleted,
  }: Omit<UpdateTableRows, "tableRows"> & { tableRows: MaybeNewOrUpdatedTableRow[] }) {
    await pgdb.task(async (t) => {
      if (deleted.length) {
        const query = `DELETE FROM "table_rows" WHERE "table_id" = $1 AND "id" IN ($2:csv)`
        await t.none(query, [tableId, deleted])
      }

      for (const row of tableRows) {
        if (row?.isCreated) {
          const query = `INSERT INTO "table_rows" ("start", "finish", "is_paid", "title", "description", "order", "entity_id", "table_id")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`

          await t.none(query, [
            row.start,
            row.finish,
            row.is_paid,
            row.title,
            row.description,
            row.order,
            row.entity_id,
            tableId,
          ])
        } else if (row?.isUpdated && !row?.isCreated) {
          // const map = [{ front: "isPaid", back: "is_paid" }]
          // const build = '"' + row.updatedKeys.join('", "') + '"'
          // const query = `UPDATE "table_rows" SET `
          // TODO: Дописать обновление
        }
      }
    })
  }
}

export default TableModel
