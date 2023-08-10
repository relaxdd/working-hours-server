import { NextFunction, Request, Response } from 'express'

export function checkIdParam(req: Request, res: Response, next: NextFunction): Response | void {
  const id = req.params?.['id']

  if (!id) {
    return res.status(400).json({ error: 'Ошибка! Не указан id пользователя' })
  }

  next()
}