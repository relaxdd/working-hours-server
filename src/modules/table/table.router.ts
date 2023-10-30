import { Router } from 'express'
import checkAuth from '../../middlewares/checkAuth'
import tableController from './table.controller'
import { validateCreateTable, validateIdParam, validateRenameTable } from './table.middlewares'

const tableRouter = Router()

tableRouter.use(checkAuth)

tableRouter.get('/', tableController.getAllTables)
tableRouter.post('/', validateCreateTable, tableController.createTable)
tableRouter.get('/:id', validateIdParam, tableController.getOne)
tableRouter.patch('/:id', validateRenameTable, tableController.renameTable)
tableRouter.delete('/:id', validateIdParam, tableController.deleteTable)

export default tableRouter
