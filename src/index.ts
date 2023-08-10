import path from 'path'
import { __abs_path } from './defines'
import express from 'express'
import { config } from 'dotenv'
import router from './router'

config({
  path: path.resolve(__abs_path, '.env.development'),
  debug: true
})

const PORT = process?.env?.['PORT'] || 5000

function main() {
  const app = express()

  app.use('/api', router)

  app.listen(PORT, () => {
    console.log(`[express]: Server is running at ${PORT} port`)
  })
}

try {
  main()
} catch (e) {
  console.log((e as Error).message)
  process.exit(0)
}