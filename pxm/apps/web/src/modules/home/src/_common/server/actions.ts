'use server'

import { cookies } from 'next/headers'

import { Fetcher } from '@amplifi-workspace/static-shared'

import { FileConfig } from '../types/downloadVariantTypes'
import { Role } from '../types/roleTypes'

export type UserTypes = {
  first_name: string
  last_name: string
  email: string
  active: boolean
  authenticated: boolean
  ci_session: string
  language: string
  role: string
  user_id: string
  uid: string
  regions: {
    active: boolean
    id: string
    is_primary: boolean
    name: string
    rethinkdb_id: string
  }[]
  lightboxes: {
    created_by: string
    created_date: string
    id: string
    item_count: number
    name: string
    read_roles: string[]
    write_roles: string[]
  }[]
  v3_enabled?: boolean
}

export async function getSession(): Promise<UserTypes> {
  const token = cookies().get('access_token')?.value ?? ''

  const sessionData = await Fetcher<UserTypes>({
    url: `/user/session`,
    method: 'GET',
    headers: {
      'access-token': token,
    },
  })

  return sessionData
}

// file copmpress api
type downloadPayload = {
  entities?: {
    name: string
    id: string
    type: string
  }[]
  file_config: FileConfig
  entity_type?: string
  region: string[]
  wait: boolean
  role: string[] | string
  lightbox_id?: string
}
type downloadResponse = { message?: string; download_link?: string }
export async function downloadFile(payload: downloadPayload) {
  const response = await Fetcher<downloadResponse>({
    url: `/file/compress`,
    method: 'POST',
    payload,
    target: 'CLIENT_UPLOAD_API',
  })

  return response
}

type GetUsersListPayload = {
  roles?: Role[]
  includeSelf?: boolean
  excludedUserIds?: string[]
}

export type User = {
  name: string
  id: string
  email: string
}

type GetUsersListResponse = {
  count: number
  data: User[]
}

export async function getUsersList({
  roles = ['admin', 'superadmin'],
  includeSelf = false,
  excludedUserIds,
}: GetUsersListPayload = {}) {
  const response = await Fetcher<GetUsersListResponse>({
    url: `/user/search`,
    method: 'POST',
    payload: {
      filter: [
        {
          key: 'filter_by_hostname',
          value: true,
        },
        {
          key: 'include_self',
          value: includeSelf,
        },
        {
          key: 'role',
          value: roles,
        },
        ...(excludedUserIds
          ? [
              {
                key: 'exclude_users',
                value: excludedUserIds,
              },
            ]
          : []),
      ],
      start: 0,
      limit: 1000,
    },
  })

  return response
}
