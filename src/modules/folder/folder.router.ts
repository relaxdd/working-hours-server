import { Router } from 'express'
import checkAuth from '../../middlewares/checkAuth'
import { checkSecret, validateCreateDir, validateFolder } from './folder.middlewares'
import folderController from './folder.controller'

const folderRouter = Router()

folderRouter.use(checkAuth)
folderRouter.use(checkSecret)

folderRouter.get('/root', validateFolder, folderController.getRootPath)
folderRouter.post('/dir', validateCreateDir, folderController.createDir)

export default folderRouter
