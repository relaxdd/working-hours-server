class ApiError extends Error {
  public code: number
  public error: string | undefined
  public additional: {} | undefined

  public constructor(code: number, error?: string, additional?: {}, message?: string) {
    super(message)

    this.name = 'ApiError'
    this.code = code
    this.error = error
    this.additional = additional
  }
}

export default ApiError