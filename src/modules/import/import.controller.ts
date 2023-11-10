import { Request, Response, NextFunction } from "express"
import { ImportTableBody, TMulterFiles } from "./import.scheme"
import importService from "./import.service"
import ApiError from "../../utils/errors/ApiError"

const IMPORT_DEF = {
  MAX_SIZE: 33554432,
}

const IMPORT_ERR = {
  EMPTY_FILE: "Файл таблицы обьязателен для импорта",
  SIZE_LIMIT: "Максимальный размер загружаемого файла 32Мб.",
  NO_EXTENSION: "Расширение файла должно быть .json",
}

class ImportController {
  public options(req: Request, res: Response, next: NextFunction) {
    try {
      return res.end()
    } catch (err) {
      return next(err)
    }
  }

  public async allData(req: Request<any, any, ImportTableBody>, res: Response, next: NextFunction) {
    const { tableId, mergeEntities } = req.body

    try {
      const files = req.files as TMulterFiles<"table" | "options">
      const tableFile = files?.table?.[0]
      const optionsFile = files?.options?.[0]

      if (!tableFile) {
        return res.status(400).json({ message: IMPORT_ERR.EMPTY_FILE })
      }

      this.validateImportFile(tableFile)

      if (!optionsFile) {
        await importService.table({ tableId, tableFile })
      } else {
        this.validateImportFile(optionsFile)

        await importService.all({
          tableId,
          tableFile,
          optionsFile,
          mergeEntities,
        })
      }

      return res.end()
    } catch (err) {
      return next(err)
    }
  }

  private validateImportFile(file: Express.Multer.File) {
    if (!file.mimetype.includes("application/json")) {
      throw new ApiError(IMPORT_ERR.NO_EXTENSION, 400)
    }

    if (file.size > IMPORT_DEF.MAX_SIZE) {
      throw new ApiError(IMPORT_ERR.SIZE_LIMIT, 400)
    }
  }
}

export default new ImportController()
