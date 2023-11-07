interface ITransform {
  backend: string;
  frontend: string;
}

export const transformMap: ITransform[] = [
  {
    backend: "round_step",
    frontend: "dtRoundStep",
  },
  {
    backend: "hidden_cols",
    frontend: "hiddenCols",
  },
  {
    backend: "using_keys",
    frontend: "usingKeys",
  },
  {
    backend: "type_adding",
    frontend: "typeOfAdding",
  },
];
