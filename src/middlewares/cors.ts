import { NextFunction, Request, Response } from 'express'

function cors(obj: { origin: string, credentials?: boolean }) {
  return function (_: Request, res: Response, next: NextFunction) {
    res.setHeader('Access-Control-Allow-Origin', obj.origin)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (obj?.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true')
    }

    next()
  }
}

export default cors