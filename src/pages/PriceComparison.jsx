import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useProcurement } from '../context/ProcurementContext'
import './PriceComparison.css'

export default function PriceComparison() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedPriceRange, setSelectedPriceRange] = useState('')
  const [sortField, setSortField] = useState('priceMin')
  const [sortOrder, setSortOrder] = useState('asc')
  const [budgetGoal, setBudgetGoal] = useState(1000)
  const { items: procurementItems, getTotalBudget } = useProcurement()

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

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/devices.json`)
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

  // 筛选设备
  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
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

      return matchesCategory && matchesPrice
    })
  }, [devices, selectedCategory, selectedPriceRange, priceRanges])

  // 排序设备
  const sortedDevices = useMemo(() => {
    return [...filteredDevices].sort((a, b) => {
      const aVal = a[sortField] || Infinity
      const bVal = b[sortField] || Infinity
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [filteredDevices, sortField, sortOrder])

  // 计算统计数据
  const statistics = useMemo(() => {
    const validDevices = filteredDevices.filter(d => d.priceMin !== null && d.priceMin !== undefined)

    // 按分类统计
    const categoryStats = {}
    categories.filter(c => c.id).forEach(cat => {
      const catDevices = validDevices.filter(d => d.categories.includes(cat.id))
      if (catDevices.length > 0) {
        const avgPrice = catDevices.reduce((sum, d) => sum + d.priceMin, 0) / catDevices.length
        categoryStats[cat.id] = {
          count: catDevices.length,
          avgPrice: Math.round(avgPrice)
        }
      }
    })

    // 按价格区间统计
    const rangeStats = {}
    priceRanges.filter(r => r.id).forEach(range => {
      const rangeDevices = validDevices.filter(d => {
        if (range.min === null) return true
        if (range.max === null) return d.priceMin >= range.min
        return d.priceMin >= range.min && d.priceMin < range.max
      })
      rangeStats[range.id] = rangeDevices.length
    })

    // 价格分布
    const allPrices = validDevices.map(d => d.priceMin).sort((a, b) => a - b)
    const minPrice = allPrices.length > 0 ? allPrices[0] : null
    const maxPrice = allPrices.length > 0 ? allPrices[allPrices.length - 1] : null

    return {
      totalCount: filteredDevices.length,
      validCount: validDevices.length,
      categoryStats,
      rangeStats,
      minPrice,
      maxPrice,
      allPrices
    }
  }, [filteredDevices, categories, priceRanges])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const getSafePercentage = (value, total) => {
    if (!total || total <= 0) return 0
    return Math.min((value / total) * 100, 100)
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

  const getPriceRange = (min) => {
    if (min === null || min === undefined) return '待定'
    if (min < 10) return '0-10万'
    if (min < 50) return '10-50万'
    if (min < 100) return '50-100万'
    return '100万以上'
  }

  if (loading) {
    return (
      <div className="price-comparison-page">
        <div className="loading">加载中...</div>
      </div>
    )
  }

  return (
    <div className="price-comparison-page">
      <div className="price-header">
        <h1 className="price-title">价格对比</h1>
        <p className="price-subtitle">共 {statistics.totalCount} 台设备，其中 {statistics.validCount} 台有价格信息</p>
      </div>

      {/* 价格统计 */}
      <div className="statistics-container">
        <div className="statistics-card">
          <h3 className="statistics-title">价格概览</h3>
          <div className="price-overview">
            {statistics.minPrice !== null && (
              <>
                <div className="price-stat">
                  <span className="price-label">最低价</span>
                  <span className="price-value price-low">{statistics.minPrice}万</span>
                </div>
                <div className="price-stat">
                  <span className="price-label">最高价</span>
                  <span className="price-value price-high">{statistics.maxPrice}万</span>
                </div>
              </>
            )}
            <div className="price-stat">
              <span className="price-label">价格差</span>
              <span className="price-value">
                {statistics.minPrice !== null ? `${statistics.maxPrice - statistics.minPrice}万` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="statistics-card">
          <h3 className="statistics-title">分类平均价格</h3>
          <div className="category-stats">
            {Object.entries(statistics.categoryStats)
              .sort((a, b) => b[1].avgPrice - a[1].avgPrice)
              .map(([category, stats]) => (
                <div key={category} className="category-stat-row">
                  <span className="category-name">{category}</span>
                  <div className="category-price-bar">
                    <div
                      className="category-price-fill"
                      style={{ width: `${getSafePercentage(stats.avgPrice, 200)}%` }}
                    ></div>
                  </div>
                  <span className="category-avg-price">{stats.avgPrice}万</span>
                  <span className="category-count">({stats.count}台)</span>
                </div>
              ))}
          </div>
        </div>

        <div className="statistics-card">
          <h3 className="statistics-title">价格区间分布</h3>
          <div className="range-stats">
            {priceRanges.filter(r => r.id).map(range => (
              <div key={range.id} className="range-stat-row">
                <span className="range-name">{range.name}</span>
                <div className="range-bar">
                  <div
                    className="range-fill"
                    style={{ width: `${getSafePercentage(statistics.rangeStats[range.id] || 0, statistics.validCount)}%` }}
                  ></div>
                </div>
                <span className="range-count">{statistics.rangeStats[range.id]}台</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 筛选控制 */}
      <div className="price-controls">
        <div className="control-group">
          <label className="control-label">分类筛选</label>
          <select
            className="control-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label className="control-label">价格区间</label>
          <select
            className="control-select"
            value={selectedPriceRange}
            onChange={(e) => setSelectedPriceRange(e.target.value)}
          >
            {priceRanges.map(range => (
              <option key={range.id} value={range.id}>{range.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 价格对比表格 */}
      <div className="price-table-container">
        <table className="price-table">
          <thead>
            <tr>
              <th>设备名称</th>
              <th>分类</th>
              <th>
                <button
                  className={`sort-button ${sortField === 'priceMin' ? 'active' : ''}`}
                  onClick={() => handleSort('priceMin')}
                >
                  最低价
                  {sortField === 'priceMin' && (
                    <span className="sort-icon">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th>
                <button
                  className={`sort-button ${sortField === 'priceMax' ? 'active' : ''}`}
                  onClick={() => handleSort('priceMax')}
                >
                  最高价
                  {sortField === 'priceMax' && (
                    <span className="sort-icon">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th>价格区间</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {sortedDevices.map((device, index) => {
              const isValid = device.priceMin !== null && device.priceMin !== undefined
              const isLowest = isValid && statistics.allPrices.length > 0 && device.priceMin === statistics.minPrice
              const isHighest = isValid && statistics.allPrices.length > 0 && device.priceMin === statistics.maxPrice

              return (
                <tr
                  key={device.id}
                  className={isLowest ? 'row-lowest' : isHighest ? 'row-highest' : ''}
                >
                  <td className="name-cell">
                    <Link to={`/device/${device.id}`} className="device-link">
                      {device.name}
                    </Link>
                  </td>
                  <td className="category-cell">
                    {device.categories.map((cat, i) => (
                      <span key={i} className="category-badge">{cat}</span>
                    ))}
                  </td>
                  <td className={`price-cell ${isLowest ? 'highlight-low' : ''}`}>
                    {formatPrice(device.priceMin, device.priceMin)}
                  </td>
                  <td className={`price-cell ${isHighest ? 'highlight-high' : ''}`}>
                    {formatPrice(device.priceMax, device.priceMax)}
                  </td>
                  <td className="range-cell">
                    {getPriceRange(device.priceMin)}
                  </td>
                  <td className="status-cell">
                    {isValid ? (
                      <>
                        {isLowest && <span className="status-badge status-lowest">最低价</span>}
                        {isHighest && <span className="status-badge status-highest">最高价</span>}
                        {!isLowest && !isHighest && <span className="status-badge status-normal">正常</span>}
                      </>
                    ) : (
                      <span className="status-badge status-pending">待定</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 价格差异分析 */}
      {statistics.minPrice !== null && (
        <div className="price-diff-analysis">
          <h3 className="analysis-title">价格差异分析</h3>
          <div className="analysis-content">
            <div className="analysis-item">
              <span className="analysis-label">价格跨度：</span>
              <span className="analysis-value">{statistics.minPrice}万 - {statistics.maxPrice}万</span>
            </div>
            <div className="analysis-item">
              <span className="analysis-label">价格差异：</span>
              <span className="analysis-value">{statistics.maxPrice - statistics.minPrice}万</span>
            </div>
            <div className="analysis-item">
              <span className="analysis-label">价格倍数：</span>
              <span className="analysis-value">{(statistics.maxPrice / statistics.minPrice).toFixed(1)}x</span>
            </div>
            <div className="analysis-item">
              <span className="analysis-label">平均价格：</span>
              <span className="analysis-value">
                {statistics.allPrices.length > 0
                  ? `${Math.round(statistics.allPrices.reduce((a, b) => a + b, 0) / statistics.allPrices.length)}万`
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 图表区域 */}
      <div className="charts-section">
        <h2 className="charts-title">价格趋势图表</h2>

        {/* 价格分布图 */}
        <div className="chart-card">
          <h3 className="chart-title">价格分布图</h3>
          <p className="chart-subtitle">各价格区间设备数量分布</p>
          <div className="chart-container">
            <div className="chart-bars">
              {priceRanges.filter(r => r.id).map(range => {
                const count = statistics.rangeStats[range.id] || 0
                const maxCount = Math.max(...Object.values(statistics.rangeStats), 1)
                const barHeight = (count / maxCount) * 100
                const barColor = range.id === '0-10' ? '#22c55e' :
                               range.id === '10-50' ? '#eab308' :
                               range.id === '50-100' ? '#f97316' : '#ef4444'
                return (
                  <div key={range.id} className="chart-bar-wrapper">
                    <div className="chart-bar">
                      <div
                        className="chart-bar-fill"
                        style={{ height: `${barHeight}%`, backgroundColor: barColor }}
                      ></div>
                    </div>
                    <div className="chart-bar-label">{range.name}</div>
                    <div className="chart-bar-value">{count}台</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 分类价格对比图 */}
        <div className="chart-card">
          <h3 className="chart-title">分类价格对比图</h3>
          <p className="chart-subtitle">各大分类平均价格对比</p>
          <div className="chart-container">
            <div className="chart-bars horizontal">
              {Object.entries(statistics.categoryStats)
                .sort((a, b) => b[1].avgPrice - a[1].avgPrice)
                .map(([category, stats], index) => {
                  const maxPrice = Math.max(...Object.values(statistics.categoryStats).map(s => s.avgPrice), 1)
                  const barWidth = (stats.avgPrice / maxPrice) * 100
                  const colors = ['#667eea', '#764ba2', '#f97316', '#22c55e', '#eab308', '#ef4444', '#06b6d4', '#8b5cf6', '#ec4899']
                  return (
                    <div key={category} className="chart-bar-wrapper horizontal">
                      <div className="chart-bar-label horizontal">{category}</div>
                      <div className="chart-bar horizontal">
                        <div
                          className="chart-bar-fill horizontal"
                          style={{ width: `${barWidth}%`, backgroundColor: colors[index % colors.length] }}
                        ></div>
                      </div>
                      <div className="chart-bar-value horizontal">{stats.avgPrice}万</div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>

        {/* 预算规划图表 */}
        <div className="chart-card">
          <h3 className="chart-title">预算规划图表</h3>
          <p className="chart-subtitle">采购清单预算与目标对比</p>
          <div className="budget-chart-container">
            <div className="budget-input">
              <label className="budget-input-label">预算目标（万元）</label>
              <input
                type="number"
                className="budget-input-field"
                value={budgetGoal}
                onChange={(e) => setBudgetGoal(Number(e.target.value))}
                min="0"
                step="10"
              />
            </div>
            {procurementItems.length > 0 ? (
              <>
                <div className="budget-bars">
                  <div className="budget-bar-wrapper">
                    <div className="budget-bar-label">采购预算（最低）</div>
                    <div className="budget-bar-container">
                      <div
                        className="budget-bar-fill min-budget"
                        style={{ width: `${getSafePercentage(getTotalBudget().min, budgetGoal)}%` }}
                      ></div>
                    </div>
                    <div className="budget-bar-value">{getTotalBudget().min}万</div>
                  </div>
                  <div className="budget-bar-wrapper">
                    <div className="budget-bar-label">采购预算（最高）</div>
                    <div className="budget-bar-container">
                      <div
                        className="budget-bar-fill max-budget"
                        style={{ width: `${getSafePercentage(getTotalBudget().max, budgetGoal)}%` }}
                      ></div>
                    </div>
                    <div className="budget-bar-value">{getTotalBudget().max}万</div>
                  </div>
                  <div className="budget-bar-wrapper">
                    <div className="budget-bar-label">预算目标</div>
                    <div className="budget-bar-container">
                      <div className="budget-bar-fill goal-budget" style={{ width: '100%' }}></div>
                    </div>
                    <div className="budget-bar-value">{budgetGoal}万</div>
                  </div>
                </div>
                <div className="budget-status">
                  <div className="budget-status-item">
                    <span className="budget-status-label">设备数量：</span>
                    <span className="budget-status-value">{procurementItems.length} 种</span>
                  </div>
                  <div className="budget-status-item">
                    <span className="budget-status-label">设备总数：</span>
                    <span className="budget-status-value">{procurementItems.reduce((sum, item) => sum + item.quantity, 0)} 台</span>
                  </div>
                  <div className="budget-status-item">
                    <span className="budget-status-label">预算状态：</span>
                    <span className={`budget-status-value ${getTotalBudget().min > budgetGoal ? 'over' : getTotalBudget().max > budgetGoal ? 'warning' : 'ok'}`}>
                      {getTotalBudget().min > budgetGoal ? '已超出预算' : getTotalBudget().max > budgetGoal ? '可能超出预算' : '预算充足'}
                    </span>
                  </div>
                </div>
                <div className="budget-chart-link">
                  <Link to="/procurement" className="view-list-link">查看完整采购清单 →</Link>
                </div>
              </>
            ) : (
              <div className="empty-budget-state">
                <div className="empty-budget-icon">📋</div>
                <p>采购清单为空</p>
                <Link to="/devices" className="add-budget-items-link">添加设备到清单</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
