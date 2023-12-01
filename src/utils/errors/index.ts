import { Response } from "express"
import ApiError from "./ApiError"

export function defaultError(res: Response, err: ApiError) {
  switch (err.name) {
    case "ApiError":
      const defText = "На сервере произошла не предвиденная ошибка!"

      const obj: Record<string, any> = { message: err?.message || defText }
      if (err?.data) obj["details"] = err.data

      return res.status(err?.status || 500).json(obj)
    default:
      return res.status(500).json({ message: err.message })
  }
}
