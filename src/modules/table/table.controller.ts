import { NextFunction, Request, Response } from 'express'
import { RequestWithAuth } from '../../middlewares/checkAuth'
import TableModel from '../../models/TableModel'
import ApiError from '../../utils/errors/ApiError'

class TableController {
  public async getAllData(req: Request, res: Response, next: NextFunction) {
    try {

    } catch (err) {
      return next(err)
    }
  }

  public async getAllTables(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = TableController.extractUserId(req)
      const data = await TableModel.findAll(userId)

      return res.json(data)
    } catch (err) {
      return next(err)
    }
  }

  public async getOne(req: Request<ReqIdParam>, res: Response, next: NextFunction) {
    try {
      const userId = TableController.extractUserId(req)
      const tableId = +req.params.id
      const data = await TableModel.findOne(userId, tableId)

      return res.json(data)
    } catch (err) {
      return next(err)
    }
  }

  public async renameTable(req: Request<ReqIdParam, any, ReqBodyWithName>, res: Response, next: NextFunction) {
    try {
      const userId = TableController.extractUserId(req)
      const tableId = +req.params.id
      const { name } = req.body

      await TableModel.setName(userId, tableId, name)

      return res.json({ message: 'Таблица успешно переименована' })
    } catch (err) {
      return next(err)
    }
  }

  public async createTable(req: Request<any, any, ReqBodyWithName>, res: Response, next: NextFunction) {
    try {
      const userId = TableController.extractUserId(req)
      const { name } = req.body

      const table = await TableModel.createTable(userId, name)

      return res.json({ message: 'Таблица успешно создана', table })
    } catch (err) {
      return next(err)
    }
  }

  public async deleteTable(req: Request<ReqIdParam>, res: Response, next: NextFunction) {
    try {
      const userId = TableController.extractUserId(req)
      const tableId = +req.params.id

      await TableModel.deleteOne(userId, tableId)

      return res.json({ message: 'Таблица успешно удалена' })
    } catch (err) {
      return next(err)
    }
  }

  /* ======= Private Methods ======= */

  private static extractUserId(req: Request) {
    const userId = (req as unknown as RequestWithAuth<{ id: number }>)?.user?.id
    if (!userId) throw new ApiError('Unauthorized', 401)
    return userId
  }
}

type ReqIdParam = { id: string }
type ReqBodyWithName = { name: string }

export default new TableController
