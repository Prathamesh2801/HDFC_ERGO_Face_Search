import { createContext, useContext } from 'react'

/** @type {import('react').Context<null | ReturnType<typeof import('./SearchProvider').useSearchValue>>} */
export const SearchContext = createContext(null)

export const useSearch = () => {
  const value = useContext(SearchContext)
  if (!value) throw new Error('useSearch must be used inside <SearchProvider>')
  return value
}

export const SearchStatus = {
  Idle: 'idle',
  Searching: 'searching',
  Success: 'success',
  Error: 'error',
}
