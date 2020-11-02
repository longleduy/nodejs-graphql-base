export interface ISession extends Express.Session {
  username?: string
  token?: string
  _id: string
}
