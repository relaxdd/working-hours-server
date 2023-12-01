export interface JwtAuthPayload {
  id: number
  login: string
  email: string
  iat: number
  exp: number
}

export type JwtAuthMaybePayload = JwtAuthPayload | false

// ****** user ****** //

export interface IUser {
  id: number
  login: string
  email: string
  password: string
  created: Date
  is_activated: boolean
}

// ****** table ****** //

export interface ITable {
  id: number
  user_id: number
  name: string
  count: number
  created: Date
  password: string | null
}

export type TransformTable = Pick<ITable, 'user_id'> & { userId: ITable['user_id'] }

// ****** entity ****** //

export interface IEntity {
  id: number
  key: string
  rate: number
  text: string
  option_id: number
  table_id: number
}

export interface NewOrEditArrayFields {
  isCreated?: boolean | undefined
  isUpdated?: boolean | undefined
}

export type MaybeNewOrUpdatedEntity = IEntity & NewOrEditArrayFields
export type TypeOfAddingOption = 'fast' | 'full'

// TODO: Привести в порядок типы
export type TransformEntity = Omit<IEntity, 'table_id' | 'option_id'> & {
  tableId: IEntity['table_id']
  optionId: IEntity['option_id']
} & NewOrEditArrayFields

export type ImportEntity = Pick<IEntity, 'key' | 'rate' | 'text'> & { id?: number | undefined }

// ****** table row ****** //

export interface ITableRow {
  id: number
  table_id: number
  entity_id: number | null
  start: Date
  finish: Date
  title: string
  description: string
  is_paid: boolean
  order: number
}

export type TransformTableRow = Omit<ITableRow, 'is_paid' | 'table_id' | 'entity_id'> & {
  isPaid: ITableRow['is_paid']
  tableId: ITableRow['table_id']
  entityId: ITableRow['entity_id']
}

export type CanBeUpdatedKeyTableRows = keyof Omit<ITableRow, 'id' | 'table_id'>
export type CanBeUpdatedKeysTableRows = CanBeUpdatedKeyTableRows[]

export type CanBeUpdatedKeyTransformTableRows = keyof Omit<TransformTableRow, 'id' | 'tableId'>
export type CanBeUpdatedKeysTransformTableRows = CanBeUpdatedKeyTransformTableRows[]

export type MaybeNewOrUpdatedTransformTableRow = TransformTableRow &
  NewOrEditArrayFields & { updatedKeys?: CanBeUpdatedKeysTransformTableRows | undefined }

export type MaybeNewOrUpdatedTableRow = ITableRow &
  NewOrEditArrayFields & { updatedKeys?: CanBeUpdatedKeysTransformTableRows | undefined }
export type TransformImportTableRow = Omit<TransformTableRow, 'id' | 'tableId' | 'order'> & { order?: number | undefined }
export type ImportTableRows = Omit<ITableRow, 'id' | 'table_id' | 'order'> & { order?: number | undefined }

// ****** options ****** //

export interface IOptions {
  id: number
  table_id: number
  type_adding: TypeOfAddingOption
  round_step: number
  hidden_cols: Record<string, boolean>
  using_keys: Record<string, string>
}

export type TransformOptions = Pick<IOptions, 'id'> & {
  tableId: number
  dtRoundStep: number
  typeOfAdding: TypeOfAddingOption
  hiddenCols: Record<string, boolean>
  usingKeys: Record<string, string>
  listOfTech: TransformEntity[]
}

export type TransformImportOptions = Omit<TransformOptions, 'id' | 'tableId' | 'listOfTech'> & {
  listOfTech: ImportEntity[]
}

export type ImportOptions = Omit<IOptions, 'id' | 'table_id'>
