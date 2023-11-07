import { Router } from "express"
import checkAuth from "../../middlewares/checkAuth"
import dataController from "./data.controller"
import {
  validateDeleteEntity,
  validateIdQuery,
  validateCompare,
  validateUpdateOptions,
  validatePassword,
} from "./data.middlewares"

const dataRouter = Router()

dataRouter.use(checkAuth)

dataRouter.get("/all", validateIdQuery, dataController.getAllData)
dataRouter.post("/compare", validateCompare, dataController.comparePassword)
dataRouter.post("/password", validatePassword, dataController.updatePassword)
dataRouter.patch("/options", validateUpdateOptions, dataController.updateOptions)
dataRouter.delete("/entity", validateDeleteEntity, dataController.deleteEntities)

export default dataRouter
