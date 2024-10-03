'use client'
import { Button } from '@patterninc/react-ui'

import { setAuthState, useAppDispatch } from '@amplifi-workspace/store'

const AuthUpdater = () => {
  const dispatch = useAppDispatch()

  return (
    <Button
      as='button'
      styleType='secondary'
      onClick={() => dispatch(setAuthState(false))}
    >
      Log out
    </Button>
  )
}
export default AuthUpdater
