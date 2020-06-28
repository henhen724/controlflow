import Iron from '@hapi/iron'
import { MAX_AGE, setTokenCookie, getTokenCookie } from './auth-cookies'
import { IncomingMessage } from 'http';

const TOKEN_SECRET = process.env.TOKEN_SECRET
if (!TOKEN_SECRET)
  throw Error("Token secret is not intialized.");

export interface session {
  id: string,
  email: string
}

export async function setLoginSession(res: IncomingMessage, session: session) {
  const createdAt = Date.now()
  // Create a session object with a max age that we can validate later
  const obj = { ...session, createdAt, maxAge: MAX_AGE }
  const token = await Iron.seal(obj, TOKEN_SECRET!, Iron.defaults)

  setTokenCookie(res, token)
}

export async function getLoginSession(req: undefined | IncomingMessage): Promise<session | undefined> {
  if (!req) return
  const token = getTokenCookie(req)
  if (!token) return

  const session = await Iron.unseal(token, TOKEN_SECRET!, Iron.defaults)
  const expiresAt = session.createdAt + session.maxAge * 1000

  // Validate the expiration date of the session
  if (Date.now() < expiresAt) {
    return session
  }
}
