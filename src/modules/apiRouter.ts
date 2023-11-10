import { Router } from 'express'
import authRouter from './auth/auth.router'
import testRouter from './test/test.router'
import tableRouter from './table/table.router'
import NotFoundError from '../utils/errors/NotFoundError'
import dataRouter from './data/data.router'
import importRouter from './import/import.router'

const apiRouter = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/table', tableRouter)
apiRouter.use('/data', dataRouter)
apiRouter.use('/import', importRouter)
apiRouter.use('/test', testRouter)

apiRouter.all('*', (req, res, next) => {
  next(new NotFoundError('Неверный адрес api запроса!'))
})

export default apiRouter
