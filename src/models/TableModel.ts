import { pgdb } from "../index"
import {
  CanBeUpdatedKeysTransformTableRows,
  CanBeUpdatedKeyTableRows,
  IEntity,
  ImportEntity,
  ImportOptions,
  ImportTableRows,
  IOptions,
  ITable,
  ITableRow,
  MaybeNewOrUpdatedEntity,
  MaybeNewOrUpdatedTableRow,
  TransformTableRow,
} from "../@types"
import ApiError from "../utils/errors/ApiError"
import {
  DeleteEntities,
  UpdatePassword,
  UpdateTableRows,
  ValidateBound,
} from "../modules/data/data.scheme"
import { as } from "pg-promise"

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
  public static async loadTableMeta(tableId: number) {
    const formatYearsQuery = (column: string, order: "ASC" | "DESC") => {
      return `SELECT TO_CHAR(table_rows.start, 'YYYY-MM') AS "${column}"
              FROM public.table_rows
              WHERE table_rows.table_id = $1
              ORDER BY "${column}" ${order}
              LIMIT 1`
    }

    return await pgdb.task(async (t) => {
      const entities = await pgdb.manyOrNone<IEntity>(
        'SELECT * FROM "entities" WHERE table_id = $1',
        [tableId]
      )

      const options = await pgdb.oneOrNone<IOptions>(
        'SELECT * FROM "options" WHERE table_id = $1 LIMIT 1',
        [tableId]
      )

      const years = await t.oneOrNone<{ min: string; max: string }>(
        `SELECT (${formatYearsQuery("min", "ASC")}), (${formatYearsQuery("max", "DESC")})`,
        [tableId]
      )

      return { entities, options, years }
    })
  }

  public static async loadTableRows({ tableId, month, year }: ValidateBound) {
    const formatDateQuery = (column: string) => {
      return `TO_CHAR(table_rows.${column} AT time zone 'Europe/Moscow', 'YYYY-MM-DD"T"HH24:MI:SS.MS"+03:00"') as "${column}"`
    }

    return await pgdb.manyOrNone<ITableRow>(
      `SELECT *
       FROM public.table_rows,
            ${formatDateQuery("start")},
            ${formatDateQuery("finish")}
       WHERE table_id = $1
         AND TO_CHAR(table_rows.start, 'MM') = $2
         AND TO_CHAR(table_rows.start, 'YYYY') = $3`,
      [tableId, month, year]
    )
  }

  public static async loadTableYears(tableId: number): Promise<string[]> {
    return (await pgdb.one<{ years: string[] }>(
      `SELECT ARRAY_AGG(DISTINCT TO_CHAR(table_rows.start, 'YYYY-MM')) AS "years"
      FROM "table_rows" WHERE "table_id" = $1`, [tableId]
    )).years
  }

  public static async loadAllBound(obj: ValidateBound) {
    return await pgdb.task(async (t) => {
      const tableMeta = await this.loadTableMeta(obj.tableId)
      const tableRows = await this.loadTableRows(obj)

      return { ...tableMeta, rows: tableRows }
    })
  }

  public static async findAll(userId: number): Promise<ITable[]> {
    return await pgdb.manyOrNone<ITable>(
      `SELECT *
       FROM "tables"
       WHERE "user_id" = $1`,
      [userId]
    )
  }

  public static async findOne(userId: number, tableId: number) {
    return await pgdb.oneOrNone<ITable>(
      `SELECT *, "user_id" as "userId"
       FROM "tables"
       WHERE id = $1
         AND "user_id" = $2`,
      [tableId, userId]
    )
  }

  public static async setCount(userId: number, tableId: number, count: number) {
    await pgdb.none(
      `UPDATE "tables"
       SET "count" = $1
       WHERE "id" = $2
         AND "user_id" = $3`,
      [count, tableId, userId]
    )
  }

  public static async setName(userId: number, tableId: number, name: string) {
    await pgdb.none(
      `UPDATE "tables"
       SET "name" = $1
       WHERE "id" = $2
         AND "user_id" = $3`,
      [name, tableId, userId]
    )
  }

  public static async deleteOne(userId: number, tableId: number) {
    const resId = await pgdb.oneOrNone<{ userId: number }>(
      `SELECT "user_id" as "userId"
       FROM "tables"
       WHERE "id" = $1`,
      [tableId]
    )

    if (!resId) throw new ApiError("Таблицы с таким ID не существует", 400)

    if (resId.userId !== userId) throw new ApiError("Вам не разрешено удалять эту таблицу", 403)

    await pgdb.task(async (t) => {
      await t.none(
        `DELETE
         FROM "table_rows"
         WHERE "table_id" = $1`,
        [tableId]
      )

      await t.none(
        `DELETE
         FROM "entities"
         WHERE "table_id" = $1`,
        [tableId]
      )

      await t.none(
        `DELETE
         FROM "options"
         WHERE "table_id" = $1`,
        [tableId]
      )

      await t.none(
        `DELETE
         FROM "tables"
         WHERE "id" = $1`,
        [tableId]
      )
    })
  }

  // TODO: Поправить потом запросы

  /**
   * @param userId Идентификатор пользователя
   * @param name Название таблицы
   * @return Идентификатор созданной таблицы
   */
  public static async createTable(userId: number, name: string): Promise<ITable> {
    const user = await pgdb.oneOrNone(
      `SELECT *
       FROM "users"
       WHERE "id" = $1`,
      [userId]
    )

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

      const query3 = `INSERT INTO "entities" ("key", "rate", "text", "option_id", "table_id")
                      VALUES ('base', 250, 'Базовый', $1, $2)`
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
          : 'UPDATE entities SET "key" = $1, "rate" = $2, "text" = $3 WHERE "option_id" = $4 AND "table_id" = $5 AND "id" = $6'
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
    await pgdb.none(
      `UPDATE "options"
       SET "type_adding" = $1,
           "round_step"  = $2,
           "hidden_cols" = $3,
           "using_keys"  = $4
       WHERE "id" = $5
         AND "table_id" = $6`,
      [
        type_adding,
        round_step,
        JSON.stringify(hidden_cols),
        JSON.stringify(using_keys),
        ids.id,
        ids.table_id,
      ]
    )
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

  public static async importTableRows(tableRows: ImportTableRows[], tableId: number) {
    await pgdb.task(async (t) => {
      for (const row of tableRows) {
        await t.none(
          `INSERT INTO "table_rows" ("start", "finish", "is_paid", "title", "description", "entity_id", "table_id")
           VALUES ($1, $2, $3, $4, $5, $6, $7);`,
          [row.start, row.finish, row.is_paid, row.title, row.description, null, tableId]
        )
      }

      await t.none(
        `UPDATE "tables"
         SET "count" = $1
         WHERE "id" = $2`,
        [tableRows.length, tableId]
      )
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

      await t.none(
        `DELETE
         FROM "table_rows"
         WHERE "table_id" = $1`,
        [tableId]
      )

      const { optionsId } = await t.one<{ optionsId: number }>(
        `UPDATE "options"
         SET "type_adding" = $1,
             "round_step"  = $2,
             "hidden_cols" = $3,
             "using_keys"  = $4
         WHERE "table_id" = $5 RETURNING "id" AS "optionsId"`,
        [
          options.type_adding,
          options.round_step,
          JSON.stringify(options.hidden_cols),
          JSON.stringify(options.using_keys),
          tableId,
        ]
      )

      const entityIdAssoc: Record<"prev" | "next", number>[] = []

      for (const entity of entities) {
        const { entityId } = await t.one<{ entityId: number }>(
          `INSERT INTO "entities" ("key", "rate", "text", "option_id", "table_id")
               VALUES ($1, $2, $3, $4, $5) RETURNING "id" AS "entityId"`,
          [entity.key, entity.rate, entity.text, optionsId, tableId]
        )

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

        await t.none(
          `INSERT INTO "table_rows" ("start", "finish", "is_paid", "title", "description", "entity_id", "table_id")
           VALUES ($1, $2, $3, $4, $5, $6, $7);`,
          [row.start, row.finish, row.is_paid, row.title, row.description, row.entity_id, tableId]
        )
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
        await t.none(
          `DELETE
           FROM "table_rows"
           WHERE "table_id" = $1
             AND "id" IN ($2:csv)`,
          [tableId, deleted]
        )
      }

      for (const row of tableRows) {
        if (row?.isCreated) {
          const keys = [
            "start",
            "finish",
            "is_paid",
            "title",
            "description",
            "order",
            "entity_id",
            "table_id",
          ] satisfies (keyof ITableRow)[]

          const fields = keys.map((k) => `"${k}"`).join(", ")
          const values = keys.map((k) => `\${${k}}`).join(", ")

          const data = keys.reduce((obj, k) => {
            obj[k] = row[k]
            return obj
          }, {} as any)

          const dirty = `(\${fields:raw}) VALUES (\${values:raw});`
          const format = as.format(dirty, { fields, values })
          const query = as.format(format, data)

          await t.none('INSERT INTO "table_rows" ${query:raw}', { query })
        } //
        else if (row?.isUpdated && !row?.isCreated) {
          const updated = row?.updatedKeys || []
          if (!updated.length) continue

          const unique = [...new Set(updated)]
          const replace = TableModel.replaceTransformTableRowsKeys(unique)
          const { query, data } = TableModel.buildQueryByKeys(replace, row)
          const fields = as.format(query, data)

          await t.none(
            `UPDATE "table_rows"
             SET \${fields:raw}
             WHERE "id" = \${id}
               AND "table_id" = \${tableId}`,
            { fields, id: row.id, tableId }
          )
        }
      }

      const { count } = await pgdb.one<{ count: number }>(
        'SELECT COUNT(*) FROM "table_rows" WHERE "table_id" = $1',
        [tableId]
      )

      await t.none('UPDATE "tables" SET "count" = $1 WHERE "id" = $2', [count, tableId])
    })
  }

  private static replaceTransformTableRowsKeys(keys: CanBeUpdatedKeysTransformTableRows) {
    type Test = keyof Pick<TransformTableRow, "entityId" | "isPaid">
    const map: Record<Test, CanBeUpdatedKeyTableRows> = {
      entityId: "entity_id",
      isPaid: "is_paid",
    }

    return keys.map((front) => map?.[front as Test] || front)
  }

  private static buildQueryByKeys(keys: string[], obj: Record<string, any>) {
    const { slots, data } = keys.reduce<{ slots: string[]; data: Record<string, any> }>(
      (acc, k) => {
        acc.slots.push(`"${k}" = \${${k}}`)
        acc.data[k] = obj[k]
        return acc
      },
      { slots: [], data: {} }
    )

    return { query: slots.join(", "), data }
  }
}

export default TableModel
