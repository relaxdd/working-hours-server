import jsonwebtoken, { JwtPayload } from 'jsonwebtoken'

class JwtService {
  private static get secret() {
    const secret = process?.env?.['JWT_AUTH_SECRET']
    if (!secret) throw new Error('Не хватает данных в env окружении!')
    return secret
  }

  public static sign(payload: {}) {
    const secret = JwtService.secret
    const params = { expiresIn: '7 days' }
    return jsonwebtoken.sign(payload, secret, params)
  }

  public static decode(token: string) {
    try {
      return jsonwebtoken.decode(token) as JwtPayload
    } catch (e) {
      return false
    }
  }

  public static verify(token: string): JwtPayload | false {
    const secret = JwtService.secret

    try {
      return jsonwebtoken.verify(token, secret) as JwtPayload
    } catch (e) {
      return false
    }
  }
}

export default JwtService