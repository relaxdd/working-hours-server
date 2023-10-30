import { Router } from 'express'
import checkAuth from '../../middlewares/checkAuth'
import dataController from './data.controller'
import { validateIdQuery } from './data.middlewares'

const dataRouter = Router()

dataRouter.get('/all', checkAuth, validateIdQuery, dataController.getAllData)

export default dataRouter
