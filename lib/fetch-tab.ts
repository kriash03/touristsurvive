export function friendlyError(status: number): string {
  if (status === 429 || status === 502) return 'Our AI provider is busy right now — please retry in a moment.'
  if (status === 422) return 'The AI returned an unexpected response — please retry.'
  if (status === 400) return 'Invalid request. Try selecting a different country.'
  if (!navigator.onLine) return 'You appear to be offline. Connect to the internet to load new guides.'
  return 'Something went wrong. Please try again.'
}

export async function fetchTab(tab: string, country: string): Promise<unknown> {
  if (!navigator.onLine) throw new Error('You appear to be offline. Connect to the internet to load new guides.')
  const res = await fetch(`/api/guide/${tab}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ country }),
  })
  if (!res.ok) throw new Error(friendlyError(res.status))
  const json = await res.json()
  if (json.error) throw new Error(friendlyError(0))
  return json
}
