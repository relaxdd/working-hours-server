import mysql, { OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2/promise'

interface Query {
  query: string,
  values?: (string | number)[]
}

interface ConnectConfig {
  host: string,
  database: string,
  user: string,
  password: string,
  port?: number,
}

type QueryResponse =
  | OkPacket
  | ResultSetHeader
  | RowDataPacket[]
  | RowDataPacket[][]
  | OkPacket[]

class MySqlService {
  public static readonly errors = {
    closed: 'Вам нужно открыть подключение к базе данных!',
    connect: 'Ошибка подключения к базе данных!',
  }

  private connection: mysql.Connection | null

  public constructor() {
    this.connection = null
  }

  public async connect(config?: ConnectConfig) {
    const options: {} = config ? {
      host: config.host,
      database: config.database,
      user: config.user,
      password: config.password,
      port: config?.port
    } : MySqlService.getEnvConfig()

    this.connection = await mysql.createConnection(options)
  }

  public async query<T extends QueryResponse>(obj: Query) {
    if (!this.connection) throw new Error(MySqlService.errors.closed)
    return MySqlService.query<T>(obj, this.connection)
  }

  public close() {
    this.connection?.end()
  }

  public static async wrapper<R = any>(fn: (wpdb: MySqlService) => Promise<R>) {
    const instance = new MySqlService()

    await instance.connect()
    const result = await fn(instance)

    instance.close()

    return result as R
  }

  public static async query<T extends QueryResponse>(
    { query, values = [] }: Query, connection?: mysql.Connection,
  ) {
    const connect = connection || await (async () => {
      const config = this.getEnvConfig() as {}
      return await mysql.createConnection(config)
    })()

    const [result] = await connect.query<T>(query, values)
    return result
  }

  private static getEnvConfig() {
    return {
      host: process.env?.['DB_HOST'],
      database: process.env?.['DB_NAME'],
      user: process.env?.['DB_USER'],
      password: process.env?.['DB_PASSWORD'],
      port: (() => {
        const port = process.env?.['DB_PORT']
        return port ? Number(port) : undefined
      })(),
    }
  }
}

export default MySqlService