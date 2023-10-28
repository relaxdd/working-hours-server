import rateLimit from 'express-rate-limit'
import { configDefault } from '../defines'

const {
  LIMITER_WINDOW = configDefault.LIMITER_WINDOW,
  LIMITER_MAX_LIMIT = configDefault.LIMITER_MAX_LIMIT,
} = process.env

const limiter = rateLimit({
  windowMs: +LIMITER_WINDOW,
  limit: +LIMITER_MAX_LIMIT,
})

export default limiter
