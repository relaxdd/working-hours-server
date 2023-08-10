import path from 'path'

export const __abs_path = path.resolve(__dirname, '..')

export const PATTERN = {
  NAME: /[^a-zа-яё ]/iu,
  LOGIN: /^[a-z0-9_-]{2,20}$/i,
  EMAIL: /^([a-z0-9_.-]+)@([\da-z.-]+)\.([a-z.]{2,6})$/,
  MYSQL_DATE: /(\d{4}-\d{2}-\d{2} (?:\d{2}:){2}\d{2})/,
  DIGIT: /\d/,
  CYRILLIC: /[а-я]/i,
  UPPER: /[A-Z]+/,
  LOWER: /[a-z]+/,
  SYMBOL: /['^£$%&*()}{@#~?><,|=_+¬-]/
} satisfies Record<string, RegExp | Record<string, RegExp>>