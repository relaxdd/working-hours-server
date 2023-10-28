import nodemailer from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'

class EmailService {
  private static getConfig() {
    const port = process?.env?.['SMTP_PORT']

    const config = {
      from: process?.env?.['SMTP_FROM'],
      host: process?.env?.['SMTP_HOST'],
      port: port ? +port : undefined,
      user: process?.env?.['SMTP_USER'],
      password: process?.env?.['SMTP_PASSWORD'],
    }

    const isValid = Object.values(config).every(Boolean)

    if (!isValid) {
      const error = 'Не хватает переменных в ENV окружении!'
      throw new Error(error)
    }

    return config as ISmtpConfig
  }

  public static async sendMail(options: Mail.Options) {
    try {
      const config = EmailService.getConfig()

      const transport = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        // secure: true,
        debug: true,
        auth: {
          user: config.user,
          pass: config.password
        }
      })

      await transport.sendMail(
        { from: `${config.from} <${config.user}>`, ...options }
      )
    } catch (e) {
      console.log(e)
      return false
    }

    return true
  }
}

export interface ISmtpConfig {
  from: string,
  host: string,
  port: number,
  user: string,
  password: string,
}

export default EmailService
