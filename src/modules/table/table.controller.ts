import { Request, Response } from 'express'

class TableController {
  public static getAll(req: Request, res: Response) {
    return res.json([])
  }
}

export default TableController