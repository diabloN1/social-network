'use server'

import { cookies } from 'next/headers'

async function setSessionCookie(token: string) {
  (await cookies()).set('token', token, {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 60 * 24,
  })
}

export default setSessionCookie