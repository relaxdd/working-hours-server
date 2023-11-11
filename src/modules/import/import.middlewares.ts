import multer from 'multer'
import path from 'path'
import crypto from 'crypto'
import { celebrate } from 'celebrate'
import { tableIdSchema } from './import.scheme'
import { existsSync } from 'fs'
import { mkdir } from 'fs/promises'

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const folder = path.join(process.cwd(), 'uploads')
    if (!existsSync(folder)) await mkdir(folder)
    cb(null, folder)
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(16, function (err, raw) {
      cb(err, raw.toString('hex') + path.extname(file.originalname))
    })
  },
})

const upload = multer({ storage })

export const multerFilesReceiver = upload.fields([
  { name: 'table', maxCount: 1 },
  { name: 'options', maxCount: 1 },
])

export const validateTableId = celebrate({
  body: tableIdSchema
})
