import { NextFunction, Request, Response } from "express"
import TableModel from "../../models/TableModel"
import dataService from "./data.service"
import { IOptions, ITransformOptions } from "../../models/types"
import { ComparePassword, DeleteEntities, UpdatePassword } from "./data.scheme"
import bcryptjs from "bcryptjs"

class DataController {
  public async getAllData(
    req: Request<any, any, any, { tableId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { rows = [], options, entities } = await TableModel.loadAllBound(+req.query.tableId)

      const tOptions = dataService.transformOptions(options, entities)
      const tTableRows = dataService.transformTableRows(rows)

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
    req: Request<any, any, ITransformOptions>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { options, entities } = dataService.normalizeOptions(req.body)

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
}

export default new DataController()
