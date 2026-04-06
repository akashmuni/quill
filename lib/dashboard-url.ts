/** Build same-path URL with optional `g` (generation id) query param. */
export function pathWithGenerationQuery(
  pathname: string,
  currentSearch: URLSearchParams,
  generationId: string | null,
) {
  const params = new URLSearchParams(currentSearch.toString())
  if (generationId) params.set('g', generationId)
  else params.delete('g')
  const q = params.toString()
  return q ? `${pathname}?${q}` : pathname
}
