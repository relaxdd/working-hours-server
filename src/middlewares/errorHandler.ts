import { NextFunction, Request, Response } from "express"
import { STATUS_CODES } from "../defines"
import { ValidationError } from "joi"
import ApiError from "../utils/errors/ApiError"

function errorHandler(
  err: { statusCode?: number; message?: string },
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR } = err
  let { message } = err

  if (err instanceof ValidationError) {
    return res.status(400).send({
      statusCode: 400,
      message: err.message,
      details: err.details,
    })
  }

  if (err instanceof ApiError) {
    return res.status(err.status).send({
      statusCode: err.status,
      message: err.message,
      details: err.data,
    })
  }

  if (err instanceof Error) {
    return res.status(500).json({
      statusCode: 500,
      message: "На сервере произошла ошибка",
      details: {
        message: err.message,
      },
    })
  }

  if (statusCode === STATUS_CODES.INTERNAL_SERVER_ERROR) {
    console.error(err)
    message = "Что-то пошло не так"
  }

  return res.status(statusCode).send({ message })
}

export default errorHandler
