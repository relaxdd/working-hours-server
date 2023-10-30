import { IEntity, ITableRow } from '../../models/types'

export type TransformEntity = Omit<IEntity, 'table_id' | 'option_id'> & { tableId: number, optionId: number }

export type TransformTableRow = Omit<ITableRow, 'is_paid' | 'table_id' | 'entity_id'> & {
  isPaid: boolean,
  tableId: number,
  entityId: number
}

export interface ITransformOptions {
  dtRoundStep: number,
  typeOfAdding: string,
  hiddenCols: Record<string, boolean>,
  usingKeys: Record<string, string>,
  listOfTech: TransformEntity[]
}
