import { NextFunction, Request, Response } from 'express'
import type { ObjectSchema } from 'joi'

function validateJsonBody(schema: ObjectSchema) {
  return async function (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      await schema.validateAsync(req.body)
    } catch (e) {
      return res.status(400).json({ error: `Ошибка валидации! ${(e as Error).message}` })
    }

    next()
  }
}

export default validateJsonBody