import type { CustomHelpers, Extension, Root } from 'joi'
import BaseJoi from 'joi'
import JoiDate from '@joi/date'
import type { MaybeNewOrUpdatedTransformTableRow, TransformEntity, TransformOptions, } from '../../@types'

export type ValidateBound = { tableId: number, month: string, year: string }
export type DeleteEntities = { tableId: number; remove: number[] }
export type ComparePassword = { password: string; hash: string }
export type UpdatePassword = { tableId: number; password: string | null }

export type UpdateTableRows = {
  tableId: number
  tableRows: MaybeNewOrUpdatedTransformTableRow[]
  deleted: number[]
}

const Joi = BaseJoi.extend(JoiDate as unknown as Extension) as Root
const idSchema = Joi.number().integer().positive().required()

function validateDate(year: string, helper: CustomHelpers) {
  const isValid = +year <= +(new Date().toLocaleString('ru-RU', { year: 'numeric' }))
  return isValid ? year : helper.message({ 'custom': 'Нельзя получить данные передав будущий год' })
}

export const validateBoundSchema = Joi.object<ValidateBound, true>({
  tableId: Joi.number().integer().positive().required(),
  month: Joi.string().pattern(/^(0[1-9]|1[0-2])$/).trim().required(),
  year: Joi.string().pattern(/^(\d{4})$/).custom(validateDate).required()
})

export const compareSchema = Joi.object<ComparePassword, true>({
  password: Joi.string().min(6).required().messages({
    'string.base': `Поле "password" должно быть типа 'string'`,
    'string.min': `Поле "password" должен иметь минимальную длину в 6 символов`,
    'any.required': `Поле "password" является обьязательным полем`,
  }),
  hash: Joi.string().required(),
})

export const passwordSchema = Joi.object<UpdatePassword, true>({
  tableId: idSchema,
  password: Joi.string().min(6).allow(null).required(),
})

export const deleteEntitySchema = Joi.object<DeleteEntities, true>({
  tableId: idSchema,
  remove: Joi.array().items(idSchema).required(),
})

export const entitySchema = Joi.object<TransformEntity, true>({
  id: idSchema,
  tableId: idSchema,
  optionId: idSchema,
  key: Joi.string().pattern(/^[a-z0-9_-]+$/i).required(),
  text: Joi.string().pattern(/^[a-zа-я0-9_ ]+$/i).required(),
  rate: Joi.number().integer().positive().required(),
  isCreated: Joi.boolean().default(false).optional(),
  isUpdated: Joi.boolean().default(false).optional(),
})

export const optionsSchema = Joi.object<TransformOptions, true>({
  id: idSchema,
  tableId: idSchema,
  dtRoundStep: Joi.number().integer().positive().allow(0).required(),
  hiddenCols: Joi.object().pattern(/^/, Joi.boolean()).required(),
  usingKeys: Joi.object().pattern(/^/, Joi.string()).required(),
  typeOfAdding: Joi.string().allow('fast', 'full').required(),
  listOfTech: Joi.array().items(entitySchema).required(),
})

export const tableRowsSchema = Joi.array<MaybeNewOrUpdatedTransformTableRow[]>().items(
  Joi.object<MaybeNewOrUpdatedTransformTableRow, true>({
    id: idSchema,
    tableId: idSchema,
    entityId: idSchema.allow(null),
    start: Joi.date()
      .format('YYYY-MM-DDTHH:mm:ss.SSSZ')
      .required(),
    finish: Joi.date()
      .format('YYYY-MM-DDTHH:mm:ss.SSSZ')
      .required(),
    isPaid: Joi.boolean().required(),
    title: Joi.string().allow('').required(),
    description: Joi.string().allow('').required(),
    order: idSchema,
    isCreated: Joi.boolean().default(false).optional(),
    isUpdated: Joi.boolean().default(false).optional(),
    updatedKeys: Joi.array()
      .items(
        Joi.string().allow('start', 'finish', 'title', 'order', 'description', 'entityId', 'isPaid')
      )
      .optional(),
  })
)

export const updateTableRowsSchema = Joi.object<UpdateTableRows, true>({
  tableId: idSchema,
  tableRows: tableRowsSchema,
  deleted: Joi.array().items(Joi.number().integer().positive()).required(),
})
