import { NextFunction, Request, Response } from 'express'
import { STATUS_CODES } from '../defines'

function errorHandler(
  err: { statusCode?: number; message?: string },
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR } = err
  let { message } = err

  if (statusCode === STATUS_CODES.INTERNAL_SERVER_ERROR) {
    console.error(err)
    message = 'Что-то пошло не так'
  }

  res.status(statusCode).send({ error: message })
}

export default errorHandler
