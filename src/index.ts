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
import pgp from 'pg-promise'
import limiter from './middlewares/limiter'
import apiRouter from './modules/apiRouter'
import errorHandler from './middlewares/errorHandler'
import { configDefault } from './defines'
import rootRouter from './modules/rootRouter'

export const argv = yargs(hideBin(process.argv))
  .options({
    port: { type: 'number', default: configDefault.PORT, number: true },
    monolite: { type: 'boolean', default: undefined, boolean: true },
    mode: {
      type: 'string',
      default: 'development',
      string: true,
      choices: ['production', 'development'],
    },
  })
  .parseSync()

config({
  path: join(process.cwd(), '.env.' + argv.mode),
  debug: argv.mode === 'development',
})

const { PGCL = '' } = process.env

const {
  port: PORT = process.env?.['PORT'] || configDefault.PORT,
  monolite: IS_MONOLITE_ARCH = Boolean(+(process.env?.['IS_MONOLITE_ARCH'] || 0)),
} = argv

const CLIENT_HOST = process.env?.['CLIENT_PORT'] || configDefault.CLIENT_HOST

function getErrorHandling() {
  if (argv.mode !== 'development') {
    return {}
  }

  return {
    error: (err: any, ctx: any) => {
      console.log(ctx?.query)
      throw err
    },
  }
}

export const pgdb = pgp({
  capSQL: true,
  ...getErrorHandling(),
})(PGCL)

function main() {
  const app = express()

  app.use(limiter)
  app.use(helmet())

  if (IS_MONOLITE_ARCH) {
    app.use(express.static(process.cwd() + '/public'))
  } else {
    app.use(cors({ origin: CLIENT_HOST }))
  }

  app.use(cookieParser())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  app.use('/api', apiRouter)

  app.use(errors())
  app.use(errorHandler)

  if (IS_MONOLITE_ARCH) {
    app.use(rootRouter)
  }

  app.listen(PORT, () => {
    console.log(`[express]: Server is running at ${PORT} port`)
  })
}

try {
  main()
} catch (e) {
  console.error((e as Error).message)
  process.exit(0)
}
