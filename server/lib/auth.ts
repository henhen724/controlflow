import { serialize, parse } from 'cookie';
import { AuthenticationError } from 'apollo-server-express'
import { IncomingMessage, OutgoingMessage } from 'http';
import { User, session, sessionExpTime } from '../models/User';
import { verify } from 'jsonwebtoken';


const TOKEN_NAME = 'wi_daq_token';

export function setSession(res: OutgoingMessage, user: User) {
  setTokenCookie(res, user.generateJWT());
}

export function getSession(req: IncomingMessage, res: OutgoingMessage): session | undefined {
  if (!req) return;
  const token = getTokenCookie(req);
  if (!token) return;
  if (!process.env.TOKEN_SECRET) throw new Error("Token secret is not intialized.");
  try {
    const session = verify(token, process.env.TOKEN_SECRET) as session;
    if (session.id && session.email && session.exp && Date.now() < session.exp) {
      return session;
    }
  } catch (error) {
    deleteSession(res);
    throw new AuthenticationError(`JWT Corupted: ${error}`);
  }
  return
}

export function deleteSession(res: any) {
  const cookie = serialize(TOKEN_NAME, '', {
    maxAge: -1,
    path: '/',
  })

  res.setHeader('Set-Cookie', cookie)
}

function setTokenCookie(res: any, token: string) {
  const cookie = serialize(TOKEN_NAME, token, {
    maxAge: sessionExpTime,
    expires: new Date(Date.now() + sessionExpTime),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  })

  res.setHeader('Set-Cookie', cookie)
}



function parseCookies(req: any): undefined | { [key: string]: string } {
  // For API Routes we don't need to parse the cookies.
  if (req.cookies) return req!.cookies;
  // For pages we do need to parse the cookies.
  const cookie = req.headers.cookie;
  try {
    return parse(cookie || '');
  } catch (err) {
    console.log(err);
    return
  }
}

function getTokenCookie(req: any): undefined | string {
  const cookies = parseCookies(req);
  if (!cookies) return
  return cookies[TOKEN_NAME];
}