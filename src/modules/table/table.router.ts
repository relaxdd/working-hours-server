import { Router } from 'express'
import checkAuth from '../../middlewares/checkAuth'
import TableController from './table.controller'

const tableRouter = Router()

tableRouter.use(checkAuth)

tableRouter.get('/', TableController.getAll)

export default tableRouter