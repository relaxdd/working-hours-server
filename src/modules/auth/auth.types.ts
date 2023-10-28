export type RegisterKeysType = 'email' | 'password' | 'login' | 'confirm'
export type RegisterDtoType = Record<RegisterKeysType, string>
export type LoginKeysType = 'login' | 'password'
export type LoginDtoType = Record<LoginKeysType, string>

export interface SetPasswordDto {
  password: string;
  token: string
}

export interface IRestorePayload {
  id: number,
  login: string
}
