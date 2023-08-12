import path from 'path'
import { __abs_path } from './defines'
import express, { json } from 'express'
import { config } from 'dotenv'
import router from './router'
import cors from './middlewares/cors'

config({
  path: path.resolve(__abs_path, '.env.development'),
  debug: true
})

const SERVER_PORT = process?.env?.['PORT'] || 5000
const CLIENT_PORT = process?.env?.['CLIENT_PORT']

function main() {
  const app = express()

  if (CLIENT_PORT) {
    app.use(cors({ origin: `http://localhost:3000` }))
  }

  app.use(json())
  app.use('/api', router)

  app.listen(SERVER_PORT, () => {
    console.log(`[express]: Server is running at ${SERVER_PORT} port`)
  })
}

try {
  main()
} catch (e) {
  console.log((e as Error).message)
  process.exit(0)
}