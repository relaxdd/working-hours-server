import { TransformOptions } from "../@types"

export const defOptions: TransformOptions = {
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
