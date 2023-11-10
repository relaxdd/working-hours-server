import BaseJoi from "joi"
import JoiDate from "@joi/date"
import { HTML5_FMT } from "moment"
import type { Extension, Root } from "joi"
import type { ImportEntity, TransformImportOptions, TransformImportTableRow } from "../../@types"

export type TMulterFiles<K extends string> = Record<K, Express.Multer.File[]>
export type ImportTableBody = { tableId: number; mergeEntities?: "on" | undefined }

const Joi = BaseJoi.extend(JoiDate as unknown as Extension) as Root
const idSchema = Joi.number().integer().positive()

export const tableRowsImportSchema = Joi.array<TransformImportTableRow[]>().items(
  Joi.object<TransformImportTableRow, true>({
    entityId: idSchema.allow(null).required(),
    start: Joi.date().format(HTML5_FMT.DATETIME_LOCAL_MS).required(),
    finish: Joi.date().format(HTML5_FMT.DATETIME_LOCAL_MS).required(),
    isPaid: Joi.boolean().required(),
    title: Joi.string().allow("").required(),
    description: Joi.string().allow("").required(),
  })
)

export const entityImportSchema = Joi.object<ImportEntity, true>({
  id: idSchema.optional(),
  key: Joi.string().alphanum().required(),
  text: Joi.string()
    .pattern(/^[a-zа-я0-9_ ]+$/i)
    .required(),
  rate: Joi.number().integer().positive().required(),
})

export const entitiesImportSchema = Joi.array<ImportEntity[]>().items(entityImportSchema)

export const optionsImportSchema = Joi.object<TransformImportOptions, true>({
  dtRoundStep: Joi.number().integer().positive().allow(0).required(),
  hiddenCols: Joi.object().pattern(/^/, Joi.boolean()).required(),
  usingKeys: Joi.object().pattern(/^/, Joi.string()).required(),
  typeOfAdding: Joi.string().allow("fast", "full").required(),
  listOfTech: Joi.array().items(entityImportSchema).required(),
})

export const tableIdSchema = Joi.object<ImportTableBody, true>({
  tableId: idSchema.required(),
  mergeEntities: Joi.string().allow("on").optional(),
})
