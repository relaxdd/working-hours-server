import { NextFunction, Request, Response } from 'express'
import JwtService from '../services/JwtService'
import { JwtPayload } from 'jsonwebtoken'

export type RequestWithAuth<T extends {} = {}> = Request & { user: JwtPayload & T }

export function extractToken(req: Request) {
  return req.header('Authorization')?.split(' ')?.at(-1)?.trim()
}

export function buildCheckAuth(getTokenFn: (req: Request) => string | undefined, notAuthFn: (res: Response) => (Response | void)) {
  return function (req: Request, res: Response, next: NextFunction): Response | void {
    const token = getTokenFn(req)
    if (!token) return notAuthFn(res)

    const payload = JwtService.verify(token)
    if (payload === false) return notAuthFn(res);

    (req as RequestWithAuth)['user'] = payload
    next()
  }
}

const checkAuth = buildCheckAuth(
  (req) => extractToken(req),
  (res) => {
    const error = 'Вы не авторизированны!'
    return res.status(401).json({ error })
  }
)

export default checkAuth
