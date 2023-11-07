import { Joi } from "celebrate"
import { ITransformOptions, TransformEntity } from "../../models/types"

export type ValidateId = { tableId: number }
export type DeleteEntities = { tableId: number; remove: number[] }
export type ComparePassword = { password: string; hash: string }
export type UpdatePassword = { tableId: number; password: string | null }

const isId = Joi.number().integer().positive().required()

export const validateIdScheme = Joi.object<ValidateId, true>({
  tableId: Joi.number().integer().positive().required(),
})

export const compareScheme = Joi.object<ComparePassword, true>({
  password: Joi.string().min(6).required().messages({
    "string.base": `Поле "password" должно быть типа 'string'`,
    "string.min": `Поле "password" должен иметь минимальную длину в 6 символов`,
    "any.required": `Поле "password" является обьязательным полем`,
  }),
  hash: Joi.string().required(),
})

export const passwordScheme = Joi.object<UpdatePassword, true>({
  tableId: isId,
  password: Joi.string().min(6).allow(null).required(),
})

export const deleteEntityScheme = Joi.object<DeleteEntities, true>({
  tableId: isId,
  remove: Joi.array().items(isId).required(),
})

export const entityScheme = Joi.object<TransformEntity, true>({
  id: isId,
  tableId: isId,
  optionId: isId,
  key: Joi.string().alphanum().required(),
  text: Joi.string()
    .pattern(/^[a-zа-я0-9_ ]+$/i)
    .required(),
  rate: Joi.number().integer().positive().required(),
  isCreated: Joi.boolean().default(false).optional(),
  isUpdated: Joi.boolean().default(false).optional(),
})

export const optionsScheme = Joi.object<ITransformOptions, true>({
  id: isId,
  tableId: isId,
  dtRoundStep: Joi.number().integer().positive().allow(0).required(),
  hiddenCols: Joi.object().pattern(/^/, Joi.boolean()).required(),
  usingKeys: Joi.object().pattern(/^/, Joi.string()).required(),
  typeOfAdding: Joi.string().allow("fast", "full").required(),
  listOfTech: Joi.array().items(entityScheme).required(),
})
