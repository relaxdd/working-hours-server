import { NextFunction, Request, Response } from 'express'

function checkContentType(type: string, required = false) {
  return function (req: Request, res: Response, next: NextFunction): Response | void {
    const current = req.header('Content-Type')

    if (!current?.includes(type)) {
      const split = current?.split(';')?.[0]
      const msgStart = 'Ошибка! Тип тела запроса должен быть'
      const msgEnd = split ? `вместо '${split || 'Unknown'}` : ''

      return res.status(400).json({ error: `${msgStart} '${type}' ${msgEnd}`.trim() })
    }

    if (required && !Object.keys(req.body).length) {
      return res.status(400).json({ error: 'Ошибка! Не отправлено тело запроса или оно пустое' })
    }

    next()
  }
}

export default checkContentType