import { Router } from "express"
import checkAuth from "../../middlewares/checkAuth"
import importController from "./import.controller"
import { multerFilesReceiver, validateTableId } from "./import.middlewares"

const importRouter = Router()

importRouter.use(checkAuth)

importRouter.post("/all", multerFilesReceiver, validateTableId, (...args) => importController.allData(...args))
importRouter.post("/options", importController.options)

export default importRouter
