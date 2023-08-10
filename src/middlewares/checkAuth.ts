import { NextFunction, Request, Response } from 'express'
import JwtService from '../services/JwtService'

function checkAuth(req: Request, res: Response, next: NextFunction): Response | void {
  const token = req.header('Authorization')?.split(' ')?.at(-1)?.trim()

  function notAuthorized() {
    const error = 'Вы не авторизированны!'
    return res.status(401).json({ error })
  }

  if (!token) return notAuthorized()

  const payload = JwtService.verify(token)
  if (payload === false) return notAuthorized()

  next()
}

export default checkAuth