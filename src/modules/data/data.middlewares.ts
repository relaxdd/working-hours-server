import { celebrate } from "celebrate"
import {
  deleteEntitySchema,
  optionsSchema,
  compareSchema,
  validateIdSchema,
  passwordSchema,
  updateTableRowsSchema,
} from "./data.scheme"

export const validateIdQuery = celebrate({
  query: validateIdSchema,
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
