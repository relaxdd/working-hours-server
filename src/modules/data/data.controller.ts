import { NextFunction, Request, Response } from 'express'
import TableModel from '../../models/TableModel'
import dataService from './data.service'


class DataController {
  public async getAllData(req: Request<any, any, any, { tableId: string }>, res: Response, next: NextFunction) {
    try {
      const {
        rows = [],
        options,
        entities
      } = await TableModel.loadAllBound(+req.query.tableId)

      const tOptions = dataService.transformOptions(options, entities)
      const tTableRows = dataService.transformTableRows(rows)

      return res.json({ rows: tTableRows, options: tOptions })
    } catch (err) {
      return next(err)
    }
  }
}

export default new DataController
