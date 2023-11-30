import { NextFunction, Request, Response } from 'express'
import { ValidationError } from 'joi'
import ApiError from '../utils/errors/ApiError'

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let { message } = err

  if (err instanceof ValidationError) {
    return res.status(400).send({
      message, details: err.details,
    })
  }

  if (err instanceof ApiError) {
    return res.status(err.status).send({
      message, details: err.data,
    })
  }

  return res.status(500).json({
    message,
    details: {
      type: err?.constructor?.name || 'Error',
      message: err.message,
    },
  })
}

export default errorHandler
