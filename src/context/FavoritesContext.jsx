import { createContext, useContext, useState, useEffect } from 'react'

// 创建收藏 Context
const FavoritesContext = createContext(null)

// 自定义 Hook
export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider')
  }
  return context
}

// Provider 组件
export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([])

  // 从 localStorage 加载数据
  useEffect(() => {
    const saved = localStorage.getItem('device-favorites')
    if (saved) {
      try {
        setFavorites(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse favorites:', e)
      }
    }
  }, [])

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem('device-favorites', JSON.stringify(favorites))
  }, [favorites])

  // 添加收藏
  const addFavorite = (deviceId) => {
    setFavorites(prev => {
      if (prev.includes(deviceId)) {
        return prev
      }
      return [...prev, deviceId]
    })
  }

  // 取消收藏
  const removeFavorite = (deviceId) => {
    setFavorites(prev => prev.filter(id => id !== deviceId))
  }

  // 切换收藏状态
  const toggleFavorite = (deviceId) => {
    if (favorites.includes(deviceId)) {
      removeFavorite(deviceId)
    } else {
      addFavorite(deviceId)
    }
  }

  // 检查是否已收藏
  const isFavorite = (deviceId) => {
    return favorites.includes(deviceId)
  }

  // 清空所有收藏
  const clearFavorites = () => {
    setFavorites([])
  }

  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}
