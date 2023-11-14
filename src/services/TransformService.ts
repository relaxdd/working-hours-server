import { defOptions } from '../data'
import type {
  IEntity,
  ImportEntity,
  ImportOptions,
  ImportTableRows,
  IOptions,
  ITableRow,
  MaybeNewOrUpdatedEntity,
  MaybeNewOrUpdatedTableRow,
  MaybeNewOrUpdatedTransformTableRow,
  TransformEntity,
  TransformImportOptions,
  TransformImportTableRow,
  TransformOptions,
  TransformTableRow,
} from '../@types'

class TransformService {
  public static transformEntities(entities: IEntity[]): TransformEntity[] {
    return entities.map(({ table_id, option_id, ...it }) => ({
      ...it,
      optionId: option_id,
      tableId: table_id,
    }))
  }

  public static transformOptions(data: { options: IOptions | null, entities: IEntity[] }): TransformOptions {
    if (!data.options) {
      defOptions.listOfTech = this.transformEntities(data.entities)
      return defOptions
    }

    return {
      id: data.options.id,
      tableId: data.options.table_id,
      dtRoundStep: data.options.round_step,
      hiddenCols: data.options.hidden_cols,
      usingKeys: data.options.using_keys,
      typeOfAdding: data.options.type_adding,
      listOfTech: this.transformEntities(data.entities),
    }
  }

  public static transformTableRows(tableRows: ITableRow[]): TransformTableRow[] {
    return tableRows.map(({ is_paid, table_id, entity_id, ...it }) => {
      return {
        ...it,
        isPaid: is_paid,
        tableId: table_id,
        entityId: entity_id,
      }
    })
  }

  // *********** Normalizing *********** //

  public static normalizeEntities(entities: TransformEntity[]): MaybeNewOrUpdatedEntity[] {
    return entities.map(({ tableId, optionId, ...it }) => ({
      ...it,
      option_id: optionId,
      table_id: tableId,
    }))
  }

  public static normalizeOptions(options: TransformOptions): {
    options: IOptions
    entities: MaybeNewOrUpdatedEntity[]
  } {
    const nOptions: IOptions = {
      id: options.id,
      table_id: options.tableId,
      round_step: options.dtRoundStep,
      hidden_cols: options.hiddenCols,
      using_keys: options.usingKeys,
      type_adding: options.typeOfAdding,
    }

    return {
      options: nOptions,
      entities: this.normalizeEntities(options.listOfTech),
    }
  }

  public static normalizeImportOptions(options: TransformImportOptions): {
    options: ImportOptions
    entities: ImportEntity[]
  } {
    const nOptions: ImportOptions = {
      round_step: options.dtRoundStep,
      hidden_cols: options.hiddenCols,
      using_keys: options.usingKeys,
      type_adding: options.typeOfAdding,
    }

    return {
      options: nOptions,
      entities: options.listOfTech,
    }
  }

  public static normalizeImportTableRows(tableRows: TransformImportTableRow[]): ImportTableRows[] {
    return tableRows.map(({ isPaid, entityId, ...it }) => ({
      ...it,
      is_paid: isPaid,
      entity_id: entityId,
    }))
  }

  public static normalizeTableRows(
    tableRows: MaybeNewOrUpdatedTransformTableRow[]
  ): MaybeNewOrUpdatedTableRow[] {
    return tableRows.map(({ isPaid, entityId, tableId, ...it }) => ({
      ...it,
      is_paid: isPaid,
      table_id: tableId,
      entity_id: entityId,
    }))
  }
}

export default TransformService
