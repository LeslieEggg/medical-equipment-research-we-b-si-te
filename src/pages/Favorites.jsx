import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'
import './Favorites.css'

export default function Favorites() {
  const { favorites, removeFavorite, clearFavorites } = useFavorites()
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const response = await fetch('/data/devices.json')
        if (!response.ok) {
          throw new Error('加载设备数据失败')
        }
        const allDevices = await response.json()
        // 只保留收藏的设备
        const favoriteDevices = allDevices.filter(d => favorites.includes(d.id))
        setDevices(favoriteDevices)
      } catch (error) {
        console.error('加载失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDevices()
  }, [favorites])

  const formatPrice = (min, max) => {
    if (min === null || max === null) {
      return '价格待定'
    }
    if (min === max) {
      return `${min}万元`
    }
    return `${min}-${max}万元`
  }

  if (loading) {
    return <div className="favorites-page">加载中...</div>
  }

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <h1>我的收藏</h1>
        {favorites.length > 0 && (
          <button className="btn-clear" onClick={clearFavorites}>
            清空收藏
          </button>
        )}
      </div>

      {devices.length === 0 ? (
        <div className="empty-state">
          <p>还没有收藏任何设备</p>
          <Link to="/devices" className="btn-browse">
            浏览设备
          </Link>
        </div>
      ) : (
        <div className="favorites-grid">
          {devices.map(device => (
            <div key={device.id} className="favorite-card">
              <button
                className="btn-remove"
                onClick={() => removeFavorite(device.id)}
                title="取消收藏"
              >
                ✕
              </button>
              <Link to={`/device/${device.id}`}>
                <h3>{device.name}</h3>
                <div className="device-categories">
                  {device.categories.map((cat, index) => (
                    <span key={index} className="category-tag">{cat}</span>
                  ))}
                </div>
                <p className="device-price">{formatPrice(device.priceMin, device.priceMax)}</p>
                <p className="device-summary">{device.summary}</p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
