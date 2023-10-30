export interface IUser {
  id: number,
  login: string,
  email: string,
  password: string,
  created: Date,
  activated: boolean
}

export interface ITable {
  id: number,
  name: string,
  password: string | null,
  count: number,
  created: Date,
  user_id: number
}

export interface IEntity {
  id: number,
  key: string,
  rate: number,
  text: string,
  option_id: number,
  table_id: number
}

export interface IOptions {
  id: number,
  type_adding: 'fast' | 'full',
  round_step: number,
  hidden_cols: Record<string, boolean>,
  using_keys: Record<string, string>
}

export interface ITableRow {
  id: number,
  start: Date,
  finish: Date,
  is_paid: boolean,
  description: string,
  order: number,
  table_id: number,
  entity_id: number
}
