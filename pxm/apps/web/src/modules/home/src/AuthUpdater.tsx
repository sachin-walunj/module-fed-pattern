'use client'
import { Button } from '@patterninc/react-ui'

import { setAuthState, useAppDispatch } from '@amplifi-workspace/store'

const AuthUpdater = () => {
  const dispatch = useAppDispatch()
  return (
    <div>
      <Button
        as='button'
        styleType='secondary'
        onClick={() => dispatch(setAuthState(true))}
      >
        Log in
      </Button>
    </div>
  )
}
export default AuthUpdater
