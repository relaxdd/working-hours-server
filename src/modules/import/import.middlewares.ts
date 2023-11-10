import multer from 'multer'
import path from 'path'
import crypto from 'crypto'
import { celebrate } from 'celebrate'
import { tableIdSchema } from './import.scheme'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'))
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
