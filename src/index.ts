import express from 'express'
import { join } from 'path'
import { config } from 'dotenv'
import cors from 'cors'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import { errors } from 'celebrate'
import limiter from './middlewares/limiter'
import apiRouter from './modules/apiRouter'
import errorHandler from './middlewares/errorHandler'
import connect from './connect'

export const argv = yargs(hideBin(process.argv)).options({
  port: { type: 'number', default: 5000, number: true },
  mode: { type: 'string', default: 'development', string: true, choices: ['production', 'development'] }
}).parseSync()

config({
  path: join(process.cwd(), '.env.' + argv.mode),
  debug: argv.mode === 'development'
})

export const { PORT = argv.port, PGCL = '' } = process.env
export const pgdb = connect(PGCL)

function main() {
  const app = express()

  app.use(limiter)
  app.use(helmet())
  app.use(express.static(process.cwd() + '/public'))
  app.use(cors({ origin: 'http://localhost:3000' }))

  app.use(cookieParser())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  app.use('/api', apiRouter)

  app.use(errors())
  app.use(errorHandler)

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
