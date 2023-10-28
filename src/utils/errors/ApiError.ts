class ApiError extends Error {
  private statusCode: number
  private additional?: Record<string, any> | undefined

  constructor(message: string, statusCode: number, additional?: Record<string, any>) {
    super(message)

    this.name = 'ApiError'
    this.statusCode = statusCode
    this.additional = additional
  }
}

export default ApiError
