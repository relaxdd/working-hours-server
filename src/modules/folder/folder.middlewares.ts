import { celebrate } from 'celebrate'
import Joi from 'joi'
import bcryptjs from 'bcryptjs'
import type { NextFunction, Request, Response } from 'express'

export type TValidateFolder = { secret: string, path?: string, search?: string }

export const validateFolder = celebrate({
  query: Joi.object<TValidateFolder, true>({
    secret: Joi.string().required(),
    path: Joi.string().optional(),
    search: Joi.string().optional(),
  })
})

export const validateCreateDir = celebrate({
  body: Joi.object({
    name: Joi.string().pattern(/^[a-zA-Z0-9/]+$/).required()
  })
})

export async function checkSecret(req: Request<any, any, any, { secret?: string }>, res: Response, next: NextFunction) {
  try {
    const { secret } = req.query

    if (!secret) {
      return res.status(403).end()
    }

    const hash = process?.env?.['FOLDER']
    if (!hash) return res.status(403).end()

    const isEquals = await bcryptjs.compare(secret.trim(), hash)
    if (!isEquals) return res.status(403).end()

    next()
  } catch (err) {
    return next(err)
  }
}
