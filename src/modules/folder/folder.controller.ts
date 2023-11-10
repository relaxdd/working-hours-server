import { NextFunction, Request, Response } from 'express'
import { TValidateFolder } from './folder.middlewares'
import { join } from 'path'
import { existsSync } from 'fs'
import fs from 'fs/promises'

class FolderController {
  public async getRootPath(req: Request<any, any, any, TValidateFolder>, res: Response, next: NextFunction) {
    try {
      const { path, search } = req.query

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
  }

  public async createDir(req: Request<any, any, any, TValidateFolder>, res: Response, next: NextFunction) {
    try {
      const { name } = req.body
      const dir = join(process.cwd(), name)

      if (existsSync(dir)) {
        return res.status(400).json({
          message: 'Folder already exists'
        })
      }

      await fs.mkdir(dir)

      return res.end()
    } catch (err) {
      return next(err)
    }
  }
}

export default new FolderController
