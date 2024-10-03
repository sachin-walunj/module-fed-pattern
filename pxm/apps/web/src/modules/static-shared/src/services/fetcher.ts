import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

const API_DOMAINS = {
  API_DOMAIN: process.env.API_DOMAIN,
  CLIENT_UPLOAD_API: process.env.CLIENT_UPLOAD_API,
}
const API_USERNAME = process.env.API_USERNAME
const API_PASSWORD = process.env.API_PASSWORD

type Methods = 'GET' | 'POST' | 'DELETE' | 'PUT'
interface FetcherOptions {
  url: string
  method?: Methods
  payload?: object
  headers?: Record<string, string>
  target?: keyof typeof API_DOMAINS
}
export async function Fetcher<TResponse>({
  url,
  method = 'GET',
  payload,
  headers: headerOptions,
  target = 'API_DOMAIN',
}: FetcherOptions): Promise<TResponse> {
  const subDomain = getSubdomain()
  const urlObj = new URL(`${API_DOMAINS[target]}${url}`)
  if (subDomain && method === 'GET') {
    urlObj.searchParams.append('hostname', subDomain)
  }

  const modifiedUrl = urlObj.pathname + urlObj.search
  const response = await FetcherWithResponse(
    modifiedUrl,
    {
      method,
      body:
        method === 'GET'
          ? undefined
          : JSON.stringify({
              ...(payload || {}),
              hostname: subDomain,
            }),
      headers: headerOptions,
    },
    target
  )
  return response.json() as Promise<TResponse>
}
async function FetcherWithResponse(
  url: string,
  options?: RequestInit,
  target: keyof typeof API_DOMAINS = 'API_DOMAIN'
): Promise<Response> {
  const domain = `${API_DOMAINS[target]}${url}`

  const params = {
    ...options,
    headers: {
      'access-token': cookies().get('access_token')?.value ?? '',
      ...options?.headers,
      Authorization: `Basic ${Buffer.from(
        `${API_USERNAME}:${API_PASSWORD}`
      ).toString('base64')}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
  }
  console.log('\n Request:', domain, params)
  const response = await fetch(domain, params)

  if (!response?.ok) {
    const loginPath =
      process.env.NODE_ENV === 'development' ? '/api/auth/login' : '/login'
    response.statusText === 'Unauthorized' && redirect(loginPath)

    throw new Error(`\n\n\n Failed to fetch ${url}: ${response.statusText}`)
  }

  return response
}

export const getSubdomain = (): string | null => {
  const host = headers().get('host')
  const paths = host?.split('.')
  if (paths?.[0]) {
    return paths[0]
  }

  return null
}
