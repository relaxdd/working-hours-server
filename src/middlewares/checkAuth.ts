import { NextFunction, Request, Response } from "express"
import JwtService from "../services/JwtService"
import { JwtPayload } from "jsonwebtoken"
import UserModel from "../models/UserModel"
import * as core from "express-serve-static-core"

export interface IUserDto {
  id: number
  login: string
  email: string
}

export type JwtPayloadWithUser = JwtPayload & IUserDto

export type RequestWithUser<
  P = core.ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = qs.ParsedQs,
  Locals extends Record<string, any> = Record<string, any>
> = Request<P, ResBody, ReqBody, ReqQuery, Locals> & { user?: JwtPayloadWithUser }

export function extractToken(req: Request) {
  return req.header("Authorization")?.split(" ")?.at(-1)?.trim()
}

export function buildCheckAuth(
  getTokenFn: (req: Request) => string | undefined,
  notAuthFn: (res: Response) => Response | void
) {
  return async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    const token = getTokenFn(req)
    if (!token) return notAuthFn(res)

    const payload = JwtService.verify(token) as JwtPayloadWithUser | false

    if (payload === false) {
      await UserModel.deleteAuthToken(token)
      return notAuthFn(res)
    }

    const find = await UserModel.findUserToken(payload.id, token)
    if (!find) return res.status(403).end()
    ;(req as RequestWithUser)["user"] = payload
    next()
  }
}

const checkAuth = buildCheckAuth(
  (req) => extractToken(req),
  (res) => {
    const error = "Вы не авторизированны!"
    return res.status(401).json({ error })
  }
)

export default checkAuth
