import { Router } from 'express'
import checkAuth from '../../middlewares/checkAuth'

const testRouter = Router()

testRouter.get('/access', checkAuth, (_, res, next) => {
  try {
    return res.json({ message: 'Ваша авторизация действительна' })
  } catch (err) {
    return next(err)
  }
})

testRouter.get('/now', async (_, res, next) => {
  try {
    // const format_query = (column: string) => `to_char("${column}" at time zone 'Europe/Moscow', 'YYYY-MM-DD"T"HH24:MI:SS.MS"+03:00"') as "${column}"`
    // const test = await pgdb.one(`SELECT *, ${format_query("start")}, ${format_query("finish")} FROM "table_rows" LIMIT 1`)
    // const date = await pgdb.one(`SELECT TO_CHAR(now() at time zone 'Europe/Moscow', 'YYYY-MM-DD"T"HH24:MI:SS')`)
    // const test = await pgdb.one<{ count: number }>('SELECT COUNT(*) FROM "table_rows" WHERE "table_id" = 5')

    // const { years } = await pgdb.one<{ years: string[] }>(
    //   `SELECT ARRAY_AGG(DISTINCT TO_CHAR(table_rows.start, 'YYYY')) AS "years"
    //    FROM "table_rows"`
    // )
    //
    // return res.send({ value: years })
    return res.end()
  } catch (err) {
    return next(err)
  }
})

export default testRouter
