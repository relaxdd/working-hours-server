export type TImportTablePayload = {
  tableId: number
  tableFile: Express.Multer.File
}

export type TImportAllPayload = ImportTableBody & {
  tableFile: Express.Multer.File
  optionsFile: Express.Multer.File
}