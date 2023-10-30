import { IEntity, IOptions, ITableRow } from '../../models/types'
import { ITransformOptions, TransformEntity, TransformTableRow } from './data.types'

const defOptions: ITransformOptions = {
  dtRoundStep: 10,
  typeOfAdding: 'fast',
  hiddenCols: {
    number: false,
    entity: false,
    description: false,
  },
  usingKeys: {
    delete: 'Delete',
    up: 'ArrowUp',
    down: 'ArrowDown',
  },
  listOfTech: [],
}

class DataService {
  public transformEntities(entities: IEntity[]): TransformEntity[] {
    return entities.map(({ table_id, option_id, ...it }) => {
      return {
        ...it,
        optionId: option_id,
        tableId: table_id
      }
    })
  }

  public transformOptions(options: IOptions | null, entities: IEntity[]): ITransformOptions {
    if (!options) {
      defOptions.listOfTech = this.transformEntities(entities)
      return defOptions
    }

    return {
      dtRoundStep: options.round_step,
      hiddenCols: options.hidden_cols,
      usingKeys: options.using_keys,
      typeOfAdding: options.type_adding,
      listOfTech: this.transformEntities(entities)
    }
  }

  public transformTableRows(tableRows: ITableRow[]): TransformTableRow[] {
    return tableRows.map(({ is_paid, table_id, entity_id, ...it }) => {
      return {
        ...it,
        isPaid: is_paid,
        tableId: table_id,
        entityId: entity_id
      }
    })
  }
}

export default new DataService
