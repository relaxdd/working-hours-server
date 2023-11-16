import { Router } from 'express'
import checkAuth from '../../middlewares/checkAuth'
import dataController from './data.controller'
import {
  validateBoundQuery,
  validateCompare,
  validateDeleteEntity,
  validateIdQuery,
  validatePassword,
  validateTableRows,
  validateUpdateOptions,
} from './data.middlewares'

const dataRouter = Router()

dataRouter.use(checkAuth)

// @GET
dataRouter.get('/all', validateBoundQuery, dataController.getAllData)
dataRouter.get('/rows', validateBoundQuery, dataController.getTableRows)
dataRouter.get('/options', validateIdQuery, dataController.getOptions)
// @POST
dataRouter.post('/compare', validateCompare, dataController.comparePassword)
dataRouter.post('/password', validatePassword, dataController.updatePassword)
// @PATCH
dataRouter.patch('/options', validateUpdateOptions, dataController.updateOptions)
dataRouter.patch('/rows', validateTableRows, dataController.updateTableRows)
// @DELETE
dataRouter.delete('/entity', validateDeleteEntity, dataController.deleteEntities)

export default dataRouter
