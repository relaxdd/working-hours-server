export interface ITable {
  id: number,
  name: string,
  password: string | null,
  count: number,
  created: string,
  userId: number
}

export interface IUser {
  id: number,
  login: string,
  email: string,
  password: string,
  created: string,
  activated: boolean
}
