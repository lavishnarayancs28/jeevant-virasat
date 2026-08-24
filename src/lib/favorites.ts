import { useEffect, useState } from 'react'

const STORAGE_KEY = 'jeevant-virasat-favorites'
export type FavoriteKind = 'heritage' | 'artisan' | 'story' | 'trail'
export interface FavoriteRecord { kind: FavoriteKind; id: string; label: string; href: string; image?: string }

function readFavorites(): FavoriteRecord[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteRecord[]>(readFavorites)
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)), [favorites])
  const toggle = (favorite: FavoriteRecord) => setFavorites((current) => current.some((item) => item.kind === favorite.kind && item.id === favorite.id)
    ? current.filter((item) => !(item.kind === favorite.kind && item.id === favorite.id))
    : [...current, favorite])
  const has = (kind: FavoriteKind, id: string) => favorites.some((item) => item.kind === kind && item.id === id)
  return { favorites, toggle, has }
}
