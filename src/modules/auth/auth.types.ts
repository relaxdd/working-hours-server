export type RegisterKeysType = 'email' | 'password' | 'login' | 'confirm'
export type RegisterDtoType = Record<RegisterKeysType, string>

export type LoginKeysType = 'login' | 'password'
export type LoginDtoType = Record<LoginKeysType, string>

export interface IError {
  message: string,
  name: string,
  fields?: string[]
}