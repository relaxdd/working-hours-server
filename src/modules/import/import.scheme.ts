import type { Extension, Root } from 'joi'
import BaseJoi from 'joi'
import JoiDate from '@joi/date'
import type { ImportEntity, TransformImportOptions, TransformImportTableRow } from '../../@types'

export type TMulterFiles<K extends string> = Record<K, Express.Multer.File[]>
export type ImportTableBody = { tableId: number; mergeEntities?: 'on' | undefined }

const Joi = BaseJoi.extend(JoiDate as unknown as Extension) as Root
const idSchema = Joi.number().integer().positive()

export const tableRowsImportSchema = Joi.array<TransformImportTableRow[]>().items(
  Joi.object<TransformImportTableRow, true>({
    entityId: idSchema.allow(null).required(),
    start: Joi.date().format('YYYY-MM-DDTHH:mm:ss.SSSZ').required(),
    finish: Joi.date().format('YYYY-MM-DDTHH:mm:ss.SSSZ').required(),
    isPaid: Joi.boolean().required(),
    title: Joi.string().allow('').required(),
    description: Joi.string().allow('').required(),
    order: idSchema.optional()
  })
)

export const entityImportSchema = Joi.object<ImportEntity, true>({
  id: idSchema.optional(),
  key: Joi.string().pattern(/^[a-z0-9_-]+$/i).required(),
  text: Joi.string().pattern(/^[a-zа-я0-9_ ]+$/i).required(),
  rate: Joi.number().integer().positive().required(),
})

export const entitiesImportSchema = Joi.array<ImportEntity[]>().items(entityImportSchema)

export const optionsImportSchema = Joi.object<TransformImportOptions, true>({
  dtRoundStep: Joi.number().integer().positive().allow(0).required(),
  hiddenCols: Joi.object().pattern(/^/, Joi.boolean()).required(),
  usingKeys: Joi.object().pattern(/^/, Joi.string()).required(),
  typeOfAdding: Joi.string().allow('fast', 'full').required(),
  listOfTech: Joi.array().items(entityImportSchema).required(),
})

export const tableIdSchema = Joi.object<ImportTableBody, true>({
  tableId: idSchema.required(),
  mergeEntities: Joi.string().allow('on').optional(),
})
