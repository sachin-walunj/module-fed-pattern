import { useEffect, useState } from 'react'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import {
  InfoTooltip,
  LeftNav,
  toast,
  Toggle,
  useIsMobileView,
  useToggle,
} from '@patterninc/react-ui'

import {
  AppDispatch,
  RootState,
  setUser,
  useAppDispatch,
  useAppSelector,
} from '@amplifi-workspace/store'
import { useTranslate } from '@amplifi-workspace/web-shared'

import { updateV3Preference } from './action'
import { getSession } from '../../_common/server/actions'

import styles from './left-navbar-footer.module.scss'

interface Props {
  isExpanded: boolean
}

const LeftNavbarFooter: React.FC<Props> = ({ isExpanded }) => {
  const isV3EnabledToggle =
    useToggle('enable_v3_for_pxm') && process.env.NODE_ENV !== 'development'
  const user = useAppSelector((state: RootState) => state.user)

  const [isV3Enabled, setIsV3Enabled] = useState(user.v3_enabled ?? false)
  const router = useRouter()
  const isMobile = useIsMobileView()

  const dispatch: AppDispatch = useAppDispatch()

  const { mutate: updateUserV3Preference } = useMutation({
    mutationFn: updateV3Preference,
    onMutate: () => {
      toast({
        type: 'info',
        message: 'Updating new design preference...',
      })
    },
    onSuccess: async () => {
      // Update the user in store after the preference is updated
      const latestSession = await getSession()
      dispatch(setUser(latestSession))

      toast({
        type: 'success',
        message: 'New Design preference successfully updated.',
      })
    },
    onError: () => {
      setIsV3Enabled(!isV3Enabled)
      toast({
        type: 'error',
        message: 'Failed to update new design preference.',
      })
    },
  })

  const { t } = useTranslate('portal')

  const toggleV3State = () => {
    setIsV3Enabled(!isV3Enabled)
    updateUserV3Preference({
      id: user?.user_id,
      v3_enabled: !isV3Enabled,
    })
  }

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      if (isV3Enabled) {
        router.push('/v3/portal')
      } else {
        router.push('/portal')
        router.refresh()
      }
    }
  }, [isV3Enabled, router])

  return (
    <>
      {!isMobile && isV3EnabledToggle ? (
        <>
          <div
            className={`flex ${
              isExpanded
                ? 'no-wrap justify-content-between mx-8'
                : 'flex-wrap mx-2 gap-4'
            } fs-12 fc-purple `}
          >
            Enable V3: <Toggle checked={isV3Enabled} callout={toggleV3State} />
          </div>
          <LeftNav.Divider />
        </>
      ) : null}
      <div
        className={`${styles['timezone']} ${
          isExpanded || isMobile
            ? styles['timezoneExpanded']
            : styles['timezoneCollapsed']
        }`}
      >
        <div className='fc-purple'>
          <span className='fc-black'>{t('timeZone')}</span>
          <div>
            {!isExpanded && !isMobile ? (
              <div>{<span className='fs-10 '>(UTC+ 5:30)</span>}</div>
            ) : (
              <>
                <span className={styles['timezoneName']}>
                  Mountain Time(US & Canada)
                </span>
                <div>(UTC- 7:00)</div>
              </>
            )}
          </div>
        </div>
        {isExpanded || isMobile ? (
          <div className={styles['iconContainer']}>
            <InfoTooltip
              size='sm'
              text='This is the content inside the tooltip'
              title='Info Tooltip'
            />
          </div>
        ) : null}
      </div>
      <LeftNav.Divider />
    </>
  )
}

export default LeftNavbarFooter
