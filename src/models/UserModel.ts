import { RegisterDtoType } from "../modules/auth/auth.types"
import { pgdb } from "../index"
import { IToken, IUser } from "../@types"
import { ProfileSchema } from "../modules/auth/auth.scheme"

class UserModel {
  public static async updateProfile(userId: number, body: ProfileSchema) {
    if (!body.currentPassword) {
      const query = `UPDATE "users" SET "email" = $1 WHERE "id" = $2`
      await pgdb.none(query, [body.userEmail, userId])
    } else {
      const query = `UPDATE "users" SET "email" = $1 "password" = $2 WHERE "id" = $3`
      await pgdb.none(query, [body.userEmail, body.newPassword!, userId])
    }
  }

  public static async create({ login, email, password }: Omit<RegisterDtoType, "confirm">) {
    const query = `INSERT INTO "users" ("login", "email", "password") VALUES ($1, $2, $3);`
    await pgdb.none(query, [login, email, password])
  }

  public static async getCountByLogin(login: string): Promise<number> {
    const query = `SELECT COUNT(*) FROM "users" WHERE "login" = $1`
    return (await pgdb.one<{ count: number }>(query, [login])).count
  }

  public static async updatePassword(userId: number, hashPassword: string) {
    const query = `UPDATE "users" SET "password" = $1 WHERE "id" = $2`
    await pgdb.none(query, [hashPassword, userId])
  }

  public static async load(userId: number) {
    const query = `SELECT * FROM "users" WHERE "id" = $1`
    return await pgdb.oneOrNone<IUser>(query, userId)
  }

  public static async findByLogin(login: string) {
    const query = `SELECT * FROM "users" WHERE "login" = $1 LIMIT 1`
    return await pgdb.oneOrNone<IUser>(query, login)
  }

  public static async saveAuthToken(userId: number, token: string, prev?: string) {
    if (prev) {
      await pgdb.none(`DELETE FROM "tokens" WHERE "user_id" = $1 AND "token" = $2`, [userId, prev])
    }

    const query = `INSERT INTO "tokens" ("user_id", "token") VALUES ($1, $2)`
    await pgdb.none(query, [userId, token])
  }

  public static async deleteAuthToken(token: string) {
    const query = `DELETE FROM "tokens" WHERE "token" = $1`
    await pgdb.none(query, token)
  }

  public static async removeAuthToken(userId: number, token: string) {
    const query = `DELETE FROM "tokens" WHERE "user_id" = $1 AND "token" = $2`
    await pgdb.none(query, [userId, token])
  }

  public static async findUserToken(userId: number, token: string) {
    const query = `SELECT * FROM "tokens"  WHERE "user_id" = $1 AND "token" = $2 LIMIT 1`
    return await pgdb.oneOrNone<IToken>(query, [userId, token])
  }
}

export default UserModel
