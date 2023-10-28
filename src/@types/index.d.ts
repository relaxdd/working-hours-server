export interface JwtAuthPayload {
  id: number,
  login: string,
  email: string,
  iat: number,
  exp: number
}

export type JwtAuthMaybePayload = JwtAuthPayload | false
