export interface IUser {
  id: number
  login: string
  email: string
  password: string
  created: Date
  activated: boolean
}

export interface ITable {
  id: number
  user_id: number
  name: string
  count: number
  created: Date
  password: string | null
}

export interface IEntity {
  id: number
  key: string
  rate: number
  text: string
  option_id: number
  table_id: number
}

export interface INewOrEditEntityFields {
  isCreated?: boolean | undefined
  isUpdated?: boolean | undefined
}

export type IMaybeNewOrUpdatedEntity = IEntity & INewOrEditEntityFields
export type TypeOfAddingOption = "fast" | "full"

export interface IOptions {
  id: number
  type_adding: TypeOfAddingOption
  round_step: number
  hidden_cols: Record<string, boolean>
  using_keys: Record<string, string>
  table_id: number
}

export interface ITableRow {
  id: number
  start: Date
  finish: Date
  is_paid: boolean
  title: string
  description: string
  order: number
  table_id: number
  entity_id: number
}

export type TransformEntity = Omit<IEntity, "table_id" | "option_id"> & {
  tableId: number
  optionId: number
} & INewOrEditEntityFields

export type TransformTableRow = Omit<ITableRow, "is_paid" | "table_id" | "entity_id"> & {
  isPaid: boolean
  tableId: number
  entityId: number
  isCreated?: boolean | undefined
  isUpdated?: boolean | undefined
}

export type ITransformOptions = Pick<IOptions, "id"> & {
  tableId: number
  dtRoundStep: number
  typeOfAdding: TypeOfAddingOption
  hiddenCols: Record<string, boolean>
  usingKeys: Record<string, string>
  listOfTech: TransformEntity[]
}