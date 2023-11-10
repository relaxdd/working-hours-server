import fs from "fs/promises"
import path from "path"
import { optionsImportSchema, tableRowsImportSchema } from "./import.scheme"
import TableModel from "../../models/TableModel"
import TransformService from "../../services/TransformService"
import { TImportAllPayload, TImportTablePayload } from "./import.types"

class ImportService {
  public async table({ tableId, tableFile }: TImportTablePayload) {
    const dir = path.join(process.cwd(), tableFile.path)

    try {
      const json = await fs.readFile(dir, "utf-8")
      const data = await tableRowsImportSchema.validateAsync(JSON.parse(json))
      const nData = TransformService.normalizeImportTableRows(data)

      await TableModel.importTableRows(nData, tableId)
    } catch (err) {
      throw err
    } finally {
      await fs.unlink(dir)
    }
  }

  public async all({ tableFile, optionsFile, tableId, mergeEntities }: TImportAllPayload) {
    const tableDir = tableFile.path
    const optionsDir = optionsFile.path

    try {
      const tableData = await (async () => {
        const json = await fs.readFile(tableDir, "utf-8")
        const data = await tableRowsImportSchema.validateAsync(JSON.parse(json))

        return TransformService.normalizeImportTableRows(data)
      })()

      const optionsData = await (async () => {
        const json = await fs.readFile(optionsDir, "utf-8")
        const data = await optionsImportSchema.validateAsync(JSON.parse(json))

        return TransformService.normalizeImportOptions(data)
      })()

      await TableModel.importTableRowsWithOptions({
        tableId,
        mergeEntities,
        tableData,
        optionsData,
      })
    } catch (err) {
      throw err
    } finally {
      await fs.unlink(tableDir)
      await fs.unlink(optionsDir)
    }
  }
}

export default new ImportService()
