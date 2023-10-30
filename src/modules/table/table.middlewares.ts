import { celebrate } from 'celebrate'
import Joi from 'joi'

export const validateIdParam = celebrate({
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  })
})

export const validateCreateTable = celebrate({
  body: Joi.object({
    name: Joi.string().min(3).alphanum().required()
  })
})

export const validateRenameTable = celebrate({
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  }),
  body: Joi.object({
    name: Joi.string().min(3).alphanum().required()
  })
})
