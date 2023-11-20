import { NextFunction, Request, Response } from "express"
import bcryptjs from "bcryptjs"
import TableModel from "../../models/TableModel"
import {
  ComparePassword,
  DeleteEntities,
  UpdatePassword,
  UpdateTableRows,
  ValidateBound,
  ValidateId,
} from "./data.scheme"
import TransformService from "../../services/TransformService"
import type { TransformOptions } from "../../@types"

class DataController {
  // @Get
  public async getAllData(
    req: Request<any, any, any, Partial<ValidateBound>>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { rows, years, ...data } = await TableModel.loadAllBound(req.query as ValidateBound)

      const tOptions = TransformService.transformOptions(data)
      const tTableRows = TransformService.transformTableRows(rows)

      return res.json({ rows: tTableRows, options: tOptions, years })
    } catch (err) {
      return next(err)
    }
  }

  // @Get
  public async getTableRows(
    req: Request<any, any, any, Partial<ValidateBound>>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const tableRows = await TableModel.loadTableRows(req.query as ValidateBound)
      const tTableRows = TransformService.transformTableRows(tableRows)

      return res.json(tTableRows)
    } catch (err) {
      return next(err)
    }
  }

  // @Get
  public async getOptions(
    req: Request<any, any, any, Partial<ValidateId>>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { tableId } = req.query

      const { years, ...data } = await TableModel.loadTableMeta(tableId!)
      const tOptions = TransformService.transformOptions(data)

      return res.json({ options: tOptions, years })
    } catch (err) {
      return next(err)
    }
  }

  // @Get
  public async getYears(
    req: Request<any, any, any, Partial<ValidateId>>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { tableId } = req.query
      const years = await TableModel.loadTableYears(tableId!)
      
      return res.json(years)
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
