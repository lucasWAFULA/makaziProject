/**
 * DRF list views may return a JSON array or a paginated object
 * { count, next, previous, results: [...] }.
 */
export function asList(data) {
  if (Array.isArray(data)) return data
  if (data != null && Array.isArray(data.results)) return data.results
  return []
}
