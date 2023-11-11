export const configDefault = {
  PORT: 4000,
  CLIENT_HOST: 'http://localhost',
  SALT_LENGTH: 10,
  LIMITER_WINDOW: 60000,
  LIMITER_MAX_LIMIT: 100
}

export const STATUS_CODES = {
  CONFLICT: 409,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
}

export const SYSTEM_MESSAGES = {
  SUCCESS_CONNECT: 'The server has successfully connected to the database',
}

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
