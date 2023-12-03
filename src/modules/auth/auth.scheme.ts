import Joi from "joi"

export interface RegisterSchema {
  login: string
  email: string
  password: string
  confirm: string
}

export interface LoginSchema {
  login: string
  password: string
}

export interface RestoreSchema {
  password: string
  confirm: string
}

export interface AccessSchema {
  login: string
}

export interface ProfileSchema {
  userEmail: string
  currentPassword?: string | undefined
  newPassword?: string | undefined
  repeatPassword?: string | undefined
}

const fieldsSchema = {
  password: Joi.string().min(8).max(24).required(),
}

export const registerSchema = Joi.object<RegisterSchema, true>({
  login: Joi.string().required(),
  email: Joi.string().required(),
  password: fieldsSchema.password,
  confirm: fieldsSchema.password,
})

export const loginSchema = Joi.object<LoginSchema, true>({
  login: Joi.string().required(),
  password: fieldsSchema.password,
})

export const restoreSchema = Joi.object<RestoreSchema, true>({
  password: fieldsSchema.password,
  confirm: fieldsSchema.password,
})

export const accessScheme = Joi.object<AccessSchema, true>({
  login: Joi.string().required(),
})

export const profileShema = Joi.object<ProfileSchema, true>({
  userEmail: Joi.string().email().required(),
  currentPassword: Joi.string().allow("").optional(),
  newPassword: Joi.string().allow("").optional(),
  repeatPassword: Joi.string().allow("").optional(),
})
