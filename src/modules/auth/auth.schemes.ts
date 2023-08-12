import Joi from 'joi'

const fieldsSchema = {
  password: Joi.string().min(8).max(24).required(),
}

export const registerSchema = Joi.object({
  login: Joi.string().required(),
  email: Joi.string().required(),
  password: fieldsSchema.password,
  confirm: fieldsSchema.password
})

export const loginSchema = Joi.object({
  login: Joi.string().required(),
  password: fieldsSchema.password,
})

export const restoreSchema = Joi.object({
  password: fieldsSchema.password,
  confirm: fieldsSchema.password
})