import { getToggles } from './actions'

export async function useServerToggle(key: string) {
  const toggles = await getToggles()

  return toggles.find((toggle) => toggle.key === key)?.enabled
}
