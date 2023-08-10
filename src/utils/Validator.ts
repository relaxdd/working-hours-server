type ValidateResult =
  | { status: true }
  | { status: false, error: string }

class Validator {
  public static pattern = {
    name: /[^a-zа-яё ]/iu,
    login: /^[a-z0-9_-]{2,20}$/i,
    email: /^([a-z0-9_.-]+)@([\da-z.-]+)\.([a-z.]{2,6})$/,
    password: {
      cyrillic: /[а-я]/i,
      digit: /\d/,
      upper: /[A-Z]+/,
      lower: /[a-z]+/,
      symbol: /['^£$%&*()}{@#~?><,|=_+¬-]/
    }
  }

  public static testName(str: string): boolean {
    return !this.pattern.name.test(str)
  }

  public static testLogin(str: string): boolean {
    return this.pattern.login.test(str)
  }

  public static testEmail(str: string) {
    return this.pattern.email.test(str)
  }

  public static testPassword(str: string): ValidateResult {
    if (str.length < 8 || str.length > 24)
      return { status: false, error: 'Длина пароля должна быть от 8 до 24 символов' }
    if (this.pattern.password.cyrillic.test(str))
      return { status: false, error: 'В введенном пароле присутствует кириллица' }
    if (!this.pattern.password.digit.test(str))
      return { status: false, error: 'Пароль должен содержать как минимум 1 цифру' }
    if (!this.pattern.password.upper.test(str))
      return { status: false, error: 'Пароль должен содержать как минимум 1 заглавную букву' }
    if (!this.pattern.password.lower.test(str))
      return { status: false, error: 'Пароль должен содержать как минимум 1 строчную букву' }
    if (!this.pattern.password.symbol.test(str))
      return { status: false, error: 'Пароль должен содержать как минимум 1 специальный символ' }

    return { status: true }
  }
}

export default Validator