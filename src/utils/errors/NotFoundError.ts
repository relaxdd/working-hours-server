import ApiError from './ApiError'
import { STATUS_CODES } from '../../defines'

class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, STATUS_CODES.NOT_FOUND)
  }
}

export default NotFoundError
