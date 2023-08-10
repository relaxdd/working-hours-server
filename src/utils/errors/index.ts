import { Response } from 'express'
import ApiError from './ApiError'

export function defaultError(res: Response, err: ApiError) {
  switch (err.name) {
    case 'ApiError':
      const defText = 'На сервере произошла не предвиденная ошибка!'

      let obj = { error: err?.error || err?.message || defText }
      if (err?.additional) obj = { ...obj, ...err.additional }

      return res.status(err?.code || 500).json(obj)
    default:
      return res.status(500).json({ error: err.message })
  }
}