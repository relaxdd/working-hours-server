import type { Request } from 'express'
import { Router } from 'express'
import checkAuth from '../../middlewares/checkAuth'
import fs from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { celebrate } from 'celebrate'
import Joi from 'joi'
import bcryptjs from 'bcryptjs'

const testRouter = Router()

testRouter.get('/access', checkAuth, (_, res, next) => {
  try {
    return res.json({ message: 'Ваша авторизация действительна' })
  } catch (err) {
    return next(err)
  }
})

type TValidateFolder = { secret: string, path?: string, search?: string }

const validateFolder = celebrate({
  query: Joi.object<TValidateFolder, true>({
    secret: Joi.string().required(),
    path: Joi.string().optional(),
    search: Joi.string().optional(),
  })
})

testRouter.get('/folder', checkAuth, validateFolder, async (req: Request<any, any, any, TValidateFolder>, res, next) => {
  const { path, secret, search } = req.query
  const hash = process?.env?.['FOLDER']

  if (!hash) return res.status(403).end()

  try {
    const isEquals = await bcryptjs.compare(secret.trim(), hash)
    if (!isEquals) return res.status(403).end()

    const dir = path ? join(process.cwd(), path) : process.cwd()
    if (!existsSync(dir)) return res.status(404).end()

    const files = await fs.readdir(dir)

    if (search) {
      const filter = files.filter(it => it.includes(search))
      return res.json(filter)
    }

    return res.json(files)
  } catch (err) {
    return next(err)
  }
})

export default testRouter
