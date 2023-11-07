import {
  IEntity,
  IMaybeNewOrUpdatedEntity,
  IOptions,
  ITableRow,
  ITransformOptions,
  TransformEntity,
  TransformTableRow,
} from "../../models/types"

const defOptions: ITransformOptions = {
  id: Date.now(),
  tableId: Date.now(),
  dtRoundStep: 10,
  typeOfAdding: "fast",
  hiddenCols: {
    number: false,
    entity: false,
    description: false,
  },
  usingKeys: {
    delete: "Delete",
    up: "ArrowUp",
    down: "ArrowDown",
  },
  listOfTech: [],
}

class DataService {
  public transformEntities(entities: IEntity[]): TransformEntity[] {
    return entities.map(({ table_id, option_id, ...it }) => ({
      ...it,
      optionId: option_id,
      tableId: table_id,
    }))
  }

  public transformOptions(options: IOptions | null, entities: IEntity[]): ITransformOptions {
    if (!options) {
      defOptions.listOfTech = this.transformEntities(entities)
      return defOptions
    }

    return {
      id: options.id,
      tableId: options.table_id,
      dtRoundStep: options.round_step,
      hiddenCols: options.hidden_cols,
      usingKeys: options.using_keys,
      typeOfAdding: options.type_adding,
      listOfTech: this.transformEntities(entities),
    }
  }

  public transformTableRows(tableRows: ITableRow[]): TransformTableRow[] {
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

  public normalizeEntities(entities: TransformEntity[]): IMaybeNewOrUpdatedEntity[] {
    return entities.map(({ tableId, optionId, ...it }) => ({
      ...it,
      option_id: optionId,
      table_id: tableId,
    }))
  }

  public normalizeOptions(options: ITransformOptions) {
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

  public normalizeTableRows() {
    throw new Error("Not Implemented!")
  }
}

export default new DataService()
