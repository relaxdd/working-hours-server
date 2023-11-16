import { celebrate } from "celebrate"
import {
  deleteEntitySchema,
  optionsSchema,
  compareSchema,
  validateBoundSchema,
  passwordSchema,
  updateTableRowsSchema, validateIdSchema,
} from './data.scheme'

export const validateBoundQuery = celebrate({
  query: validateBoundSchema,
})

export const validateIdQuery = celebrate({
  query: validateIdSchema
})

export const validateCompare = celebrate({
  body: compareSchema,
})

export const validatePassword = celebrate({
  body: passwordSchema,
})

export const validateUpdateOptions = celebrate({
  body: optionsSchema,
})

export const validateDeleteEntity = celebrate({
  body: deleteEntitySchema,
})

export const validateTableRows = celebrate({
  body: updateTableRowsSchema
})
