import {
  handleAuth,
  handleCallback,
  handleLogin,
  handleLogout,
} from '@auth0/nextjs-auth0'
import moment from 'moment'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

import { auth0Login } from '../../../../server/actions'

export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: {
      organization: 'org_PZZUZUPDspJRKXip',
      responseType: 'token id_token',
      scope: 'openid profile email',
      prompt: 'login', // if you want to always show the login or sign up form regardless of session status
    },
  }),
  logout: handleLogout({
    returnTo: '/',
    logoutParams: {
      organization: 'org_PZZUZUPDspJRKXip',
    },
  }),
  callback: handleCallback({
    afterCallback: async (req: NextRequest, session: any, state: any) => {
      const cookieStore = cookies()

      try {
        if (session.idToken) {
          const { access_token: token, ci_session } = await auth0Login(
            session.idToken
          )

          cookieStore.delete('appSession')

          cookieStore.set('access_token', token, {
            httpOnly: true,
            expires: new Date(moment().add(1, 'd') as never),
          })

          cookieStore.set('ci_session', ci_session, {
            httpOnly: true,
            expires: new Date(moment().add(1, 'd') as never),
          })
        }
      } catch (error: any) {
        console.log('\n\n\n Error in callback \n\n\n', error)
      }

      return undefined
    },
  }),
})
