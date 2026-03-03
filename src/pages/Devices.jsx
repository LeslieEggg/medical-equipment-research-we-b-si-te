import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useCompare } from '../context/CompareContext'
import { useFavorites } from '../context/FavoritesContext'
import './Devices.css'

export default function Devices() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { compareDevices, addToCompare, removeFromCompare, isInCompare } = useCompare()
  const { favorites, isFavorite, toggleFavorite } = useFavorites()
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedPriceRange, setSelectedPriceRange] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 12

  const categories = [
    { id: '', name: '全部' },
    { id: '影像诊断', name: '影像诊断' },
    { id: '手术设备', name: '手术设备' },
    { id: '监护设备', name: '监护设备' },
    { id: '实验室设备', name: '实验室设备' },
    { id: 'IVF设备', name: 'IVF设备' },
    { id: '透析设备', name: '透析设备' },
    { id: '产科设备', name: '产科设备' },
    { id: '辅助设备', name: '辅助设备' },
    { id: '其他', name: '其他' }
  ]

  const priceRanges = [
    { id: '', name: '全部价格', min: null, max: null },
    { id: '0-10', name: '0-10万', min: 0, max: 10 },
    { id: '10-50', name: '10-50万', min: 10, max: 50 },
    { id: '50-100', name: '50-100万', min: 50, max: 100 },
    { id: '100+', name: '100万以上', min: 100, max: null }
  ]

  // 提取所有品牌
  const brands = useMemo(() => {
    const brandSet = new Set()
    devices.forEach(device => {
      if (device.brand) {
        brandSet.add(device.brand)
      }
    })
    const brandList = Array.from(brandSet).sort()
    return [{ id: '', name: '全部品牌' }, ...brandList.map(brand => ({ id: brand, name: brand }))]
  }, [devices])

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const response = await fetch('/data/devices.json')
        const data = await response.json()
        setDevices(data)
      } catch (error) {
        console.error('加载设备数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDevices()
  }, [])

  useEffect(() => {
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const priceRange = searchParams.get('priceRange') || ''
    setSearchQuery(search)
    setSelectedCategory(category)
    setSelectedPriceRange(priceRange)
    setCurrentPage(1)
  }, [searchParams])

  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const matchesSearch = !searchQuery ||
        device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.summary.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = !selectedCategory ||
        device.categories.includes(selectedCategory)

      const matchesPrice = !selectedPriceRange || (() => {
        const range = priceRanges.find(r => r.id === selectedPriceRange)
        if (!range || range.min === null) return true
        if (range.max === null) {
          return device.priceMin >= range.min || device.priceMax >= range.min
        }
        return (device.priceMin && device.priceMin <= range.max) ||
               (device.priceMax && device.priceMin <= range.max)
      })()

      const matchesBrand = !selectedBrand || device.brand === selectedBrand
      const matchesFavorites = !showFavoritesOnly || isFavorite(device.id)

      return matchesSearch && matchesCategory && matchesPrice && matchesBrand && matchesFavorites
    })
  }, [devices, searchQuery, selectedCategory, selectedPriceRange, selectedBrand, showFavoritesOnly, favorites, priceRanges])

  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDevices = filteredDevices.slice(startIndex, endIndex)

  const handleSearchChange = (value) => {
    setSearchQuery(value)
    setCurrentPage(1)
    updateSearchParams(value, selectedCategory, selectedPriceRange)
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    setCurrentPage(1)
    updateSearchParams(searchQuery, categoryId, selectedPriceRange)
  }

  const handlePriceRangeChange = (rangeId) => {
    setSelectedPriceRange(rangeId)
    setCurrentPage(1)
    updateSearchParams(searchQuery, selectedCategory, rangeId)
  }

  const handleBrandChange = (brandId) => {
    setSelectedBrand(brandId)
    setCurrentPage(1)
  }

  const updateSearchParams = (search, category, priceRange) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    if (priceRange) params.set('priceRange', priceRange)
    const queryString = params.toString()
    navigate(`/devices${queryString ? `?${queryString}` : ''}`, { replace: true })
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCardClick = (deviceId) => {
    navigate(`/device/${deviceId}`)
  }

  const handleCompareToggle = (e, device) => {
    e.stopPropagation()
    if (isInCompare(device.id)) {
      removeFromCompare(device.id)
    } else {
      addToCompare(device)
    }
  }

  const formatPrice = (min, max) => {
    if (min === null || max === null) {
      return '价格待定'
    }
    if (min === max) {
      return `${min}万`
    }
    return `${min}-${max}万`
  }

  if (loading) {
    return (
      <div className="devices-page">
        <div className="loading">加载中...</div>
      </div>
    )
  }

  return (
    <div className="devices-page">
      <div className="devices-header">
        <h1 className="devices-title">设备列表</h1>
        <p className="devices-subtitle">共找到 {filteredDevices.length} 台设备</p>
      </div>

      {/* 浮动对比栏 */}
      {compareDevices.length > 0 && (
        <div className="compare-bar">
          <div className="compare-bar-content">
            <span className="compare-count">{compareDevices.length}/4</span>
            <div className="compare-devices">
              {compareDevices.map(device => (
                <span key={device.id} className="compare-device-item">
                  {device.name}
                  <button
                    className="btn-remove-compare"
                    onClick={() => removeFromCompare(device.id)}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <Link to="/compare" className="btn-compare">
              开始对比
            </Link>
          </div>
        </div>
      )}

      <div className="devices-controls">
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="搜索设备名称或用途..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="category-filter">
          <select
            className="category-select"
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="category-filter">
          <select
            className="category-select"
            value={selectedPriceRange}
            onChange={(e) => handlePriceRangeChange(e.target.value)}
          >
            {priceRanges.map(range => (
              <option key={range.id} value={range.id}>{range.name}</option>
            ))}
          </select>
        </div>

        <div className="category-filter">
          <select
            className="category-select"
            value={selectedBrand}
            onChange={(e) => handleBrandChange(e.target.value)}
          >
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>

        <button
          className={`favorites-filter-button ${showFavoritesOnly ? 'active' : ''}`}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          {showFavoritesOnly ? '❤️ 仅收藏' : '🤍 全部'}
        </button>
      </div>

      {currentDevices.length === 0 ? (
        <div className="empty-state">
          <p>未找到匹配的设备</p>
          <button
            className="reset-button"
            onClick={() => {
              handleSearchChange('')
              handleCategoryChange('')
              handlePriceRangeChange('')
              handleBrandChange('')
              setShowFavoritesOnly(false)
            }}
          >
            清除筛选条件
          </button>
        </div>
      ) : (
        <>
          <div className="devices-grid">
            {currentDevices.map(device => (
              <div
                key={device.id}
                className="device-card"
                onClick={() => handleCardClick(device.id)}
              >
                <div className="device-header">
                  <h3 className="device-name">{device.name}</h3>
                  <span className="device-price">{formatPrice(device.priceMin, device.priceMax)}</span>
                </div>

                <div className="device-categories">
                  {device.categories.map((cat, index) => (
                    <span key={index} className="category-tag">{cat}</span>
                  ))}
                </div>

                <p className="device-summary">
                  {device.summary}
                </p>

                <button
                  className={`btn-add-compare ${isInCompare(device.id) ? 'active' : ''} ${compareDevices.length >= 4 && !isInCompare(device.id) ? 'disabled' : ''}`}
                  onClick={(e) => handleCompareToggle(e, device)}
                >
                  {isInCompare(device.id) ? '已添加' : '添加到对比'}
                </button>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                上一页
              </button>

              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                className="pagination-button"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
