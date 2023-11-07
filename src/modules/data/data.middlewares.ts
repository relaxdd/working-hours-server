import { celebrate } from "celebrate"
import {
  deleteEntityScheme,
  optionsScheme,
  compareScheme,
  validateIdScheme,
  passwordScheme,
} from "./data.scheme"

export const validateIdQuery = celebrate({
  query: validateIdScheme,
})

export const validateCompare = celebrate({
  body: compareScheme,
})

export const validatePassword = celebrate({
  body: passwordScheme,
})

export const validateUpdateOptions = celebrate({
  body: optionsScheme,
})

export const validateDeleteEntity = celebrate({
  body: deleteEntityScheme,
})
