import { Request, Response } from 'express'
import { extractToken } from '../../middlewares/checkAuth'
import JwtService from '../../services/JwtService'
import { JwtAuthMaybePayload } from '../../@types'
import TableModel from '../../models/TableModel'
import { defaultError } from '../../utils/errors'
import ApiError from '../../utils/errors/ApiError'


class TableController {
  public static async getAll(req: Request, res: Response) {
    const token = extractToken(req)!

    const payload = JwtService.decode(token) as JwtAuthMaybePayload

    if (payload === false) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const model = new TableModel
      const data = await model.findAll(payload.id)

      model.closeConnection()

      return res.json(data)
    } catch (e) {
      return defaultError(res, e as ApiError)
    }
  }
}

export default TableController