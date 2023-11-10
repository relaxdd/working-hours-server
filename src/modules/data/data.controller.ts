import { NextFunction, Request, Response } from "express"
import bcryptjs from "bcryptjs"
import TableModel from "../../models/TableModel"
import { ComparePassword, DeleteEntities, UpdatePassword, UpdateTableRows } from "./data.scheme"
import TransformService from "../../services/TransformService"
import type { TransformOptions } from "../../@types"

class DataController {
  public async getAllData(
    req: Request<any, any, any, { tableId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { rows = [], options, entities } = await TableModel.loadAllBound(+req.query.tableId)

      const tOptions = TransformService.transformOptions(options, entities)
      const tTableRows = TransformService.transformTableRows(rows)

      return res.json({ rows: tTableRows, options: tOptions })
    } catch (err) {
      return next(err)
    }
  }

  public async updatePassword(
    req: Request<any, any, UpdatePassword>,
    res: Response,
    next: NextFunction
  ) {
    const { tableId, password } = req.body

    try {
      const hashOrNull: UpdatePassword = {
        tableId,
        password: password ? await bcryptjs.hash(password, 10) : null,
      }

      await TableModel.updatePassword(hashOrNull)

      return res.json({ hash: hashOrNull.password })
    } catch (err) {
      return next(err)
    }
  }

  public async comparePassword(
    req: Request<any, any, ComparePassword>,
    res: Response,
    next: NextFunction
  ) {
    const { password, hash } = req.body

    try {
      const isEquals = await bcryptjs.compare(password, hash)

      if (isEquals) return res.end()
      else return res.status(403).json({ message: "Введен не верный пароль от таблицы" })
    } catch (err) {
      return next(err)
    }
  }

  public async updateOptions(
    req: Request<any, any, TransformOptions>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { options, entities } = TransformService.normalizeOptions(req.body)

      await TableModel.updateEntities(entities)
      await TableModel.updateOptions(options)

      return res.end()
    } catch (err) {
      return next(err)
    }
  }

  public async deleteEntities(
    req: Request<any, any, DeleteEntities>,
    res: Response,
    next: NextFunction
  ) {
    try {
      await TableModel.deleteEntities(req.body)
      return res.end()
    } catch (err) {
      return next(err)
    }
  }

  public async updateTableRows(
    req: Request<any, any, UpdateTableRows>,
    res: Response,
    next: NextFunction
  ) {
    const { tableRows, ...body } = req.body
    try {
      const nTableRows = TransformService.normalizeTableRows(tableRows)
      await TableModel.updateTableRows({ ...body, tableRows: nTableRows })
      return res.end()
    } catch (err) {
      return next(err)
    }
  }
}

export default new DataController()
