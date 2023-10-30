import { celebrate } from 'celebrate'
import Joi from 'joi'

export const validateIdQuery = celebrate({
  query: Joi.object({ tableId: Joi.number().integer().positive().required() })
})
