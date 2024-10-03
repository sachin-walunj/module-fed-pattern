'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { CategoryHierarchyResponse } from '@amplifi-workspace/home'
import { Fetcher, getSubdomain } from '@amplifi-workspace/static-shared'
import { IConfigState, variantsType } from '@amplifi-workspace/store'

import { UserTypes } from '../lib/StoreProvider'

interface AuthResponse {
  access_token: string
  ci_session: string
}
export async function auth0Login(token: string): Promise<AuthResponse> {
  return Fetcher<AuthResponse>({
    url: `/user/auth0_login`,
    method: 'POST',
    headers: {
      'access-token': token,
    },
  })
}

export async function getInitialData(hostname: string) {
  const res = await Fetcher({ url: `/utility/product/${hostname}/config` })
  return res
}

interface CollectionResponse {
  id: string
  name: string
}
export async function getCollection(id: string) {
  const res = await Fetcher<CollectionResponse>({ url: `/topic/${id}` })
  return res
}

interface LoginPayload {
  email: string
  password: string
  hostname: string
  remember: boolean
}
interface LoginResponse {
  access_token: string
}
export async function loginUser(payload: LoginPayload): Promise<void> {
  const { access_token: token } = await Fetcher<LoginResponse>({
    url: `/user/login`,
    method: 'POST',
    payload: {
      ...payload,
      metadata: {},
    },
  })
  cookies().set('access_token', token)
  redirect(`${process.env.ROUTE_PREFIX_V3}/portal`)
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

type ConfigResponse = Omit<IConfigState, 'regions' | 'roles'>
export async function getConfig() {
  // the fields to pluck from the config
  const fieldsToPluck = [
    'settings',
    'features',
    'topic_icon',
    'role_visibility',
    'host',
    'path',
    'metadata',
    'system_text',
    'hostname',
    'id',
    'auth0_enabled',
    'pug_templates',
    'light_box_export_fields',
    'import_visibility',
    'attribute_settings',
    'hero_attribute',
    'search_filters',
    'multiple_line_list',
    'default_sorting',
    'auth0_org_id',
    'hero_preview_attribute',
    'node',
    'name',
    'line_list',
    'tabs',
    'updated_date',
    'global_settings',
  ]
  const params = fieldsToPluck.map((field) => `pluck_fields=${field}`).join('&')
  const hostname = getSubdomain()
  const res = await Fetcher<ConfigResponse>({
    url: `/utility/product/${hostname}/config?${params}`,
  })

  return res
}

type RegionsResponse = { id: string; name: string }[]
export async function getRegions() {
  const hostname = getSubdomain()
  const res = await Fetcher<RegionsResponse>({
    url: `/region?fields=id,name&sort_column=name&hostname=${hostname}`,
  })
  return res
}

type RolesResponse = { id: string; name: string }[]
export async function getRoles() {
  const res = await Fetcher<RolesResponse>({
    url: '/role?fields=display_name,name&sort_column=display_name',
  })
  return res
}

export async function getConfigState(): Promise<IConfigState> {
  const [config, regions, roles] = await Promise.all([
    getConfig(),
    getRegions(),
    getRoles(),
  ])

  return {
    ...config,
    regions,
    roles,
  }
}

export async function getCategoryHierarchy(
  categoryId: string
): Promise<CategoryHierarchyResponse> {
  const response = await Fetcher<CategoryHierarchyResponse>({
    url: `/category/${categoryId}/hierarchy`,
    method: 'GET',
  })

  return response
}

// get all the variants to download images/videos
export const getVariants = async () => {
  const response = await Fetcher<variantsType>({
    url: '/file/variants',
    method: 'POST',
  })

  return response
}
