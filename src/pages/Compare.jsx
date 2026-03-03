import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useCompare } from '../context/CompareContext'
import './Compare.css'

export default function Compare() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { compareDevices, removeFromCompare, clearCompare } = useCompare()
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)

  // 从 URL 参数获取设备 ID 列表
  const urlIds = searchParams.get('ids')?.split(',').map(id => parseInt(id)).filter(Boolean) || []

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

  // 获取要对比的设备列表（优先使用 Context，其次使用 URL 参数）
  const getCompareList = () => {
    if (compareDevices.length > 0) {
      return compareDevices
    }
    // 从 URL 参数获取设备详情
    return devices.filter(d => urlIds.includes(d.id))
  }

  const compareList = getCompareList()

  const handleRemove = (e, deviceId) => {
    e.stopPropagation()
    removeFromCompare(deviceId)
    // 如果 URL 中有 ids，更新 URL
    if (urlIds.length > 0) {
      const newIds = urlIds.filter(id => id !== deviceId)
      if (newIds.length > 0) {
        navigate(`/compare?ids=${newIds.join(',')}`, { replace: true })
      } else {
        navigate('/compare', { replace: true })
      }
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

  // 判断该值是否与其他设备不同
  const isDifferent = (rowIndex, value) => {
    if (compareList.length <= 1) return false
    const values = compareList.map(d => {
      switch (rowIndex) {
        case 'price':
          return formatPrice(d.priceMin, d.priceMax)
        case 'category':
          return d.categories.join('、')
        case 'summary':
          return d.summary
        default:
          return ''
      }
    })
    // 检查当前值是否与至少一个不同
    return values.some(v => v !== value)
  }

  // 获取关键参数（从设备名称中提取或从 summary 中提取）
  const getKeyParams = (device) => {
    const params = []
    if (device.summary) {
      // 从 summary 中提取中文名称
      const match = device.summary.match(/设备全称：(.+?)(?:，|$)/)
      if (match) {
        params.push({ label: '全称', value: match[1] })
      }
      // 提取英文简称
      const englishMatch = device.summary.match(/\(([^)]+)\)/)
      if (englishMatch) {
        params.push({ label: '简称', value: englishMatch[1] })
      }
    }
    return params
  }

  if (loading) {
    return (
      <div className="compare-page">
        <div className="loading">加载中...</div>
      </div>
    )
  }

  if (compareList.length === 0) {
    return (
      <div className="compare-page">
        <div className="compare-header">
          <h1 className="compare-title">设备对比</h1>
          <p className="compare-subtitle">请选择要对比的设备（最多4台）</p>
        </div>
        <div className="empty-state">
          <p>当前没有选择任何设备进行对比</p>
          <Link to="/devices" className="btn-primary">
            去选择设备
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="compare-page">
      <div className="compare-header">
        <h1 className="compare-title">设备对比</h1>
        <p className="compare-subtitle">正在对比 {compareList.length} 台设备</p>
        <div className="compare-actions">
          <Link to="/devices" className="btn-secondary">
            添加更多设备
          </Link>
          {compareList.length > 0 && (
            <button className="btn-clear" onClick={clearCompare}>
              清空对比
            </button>
          )}
        </div>
      </div>

      <div className="compare-container">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="row-label">对比项目</th>
              {compareList.map(device => (
                <th key={device.id} className="device-header">
                  <div className="device-info">
                    <h3 className="device-name">{device.name}</h3>
                    <button
                      className="btn-remove"
                      onClick={(e) => handleRemove(e, device.id)}
                      title="移除此设备"
                    >
                      &times;
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* 分类 */}
            <tr>
              <td className="row-label">分类</td>
              {compareList.map(device => (
                <td key={device.id} className={isDifferent('category', device.categories.join('、')) ? 'different' : ''}>
                  <div className="category-tags">
                    {device.categories.map((cat, index) => (
                      <span key={index} className="category-tag">{cat}</span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* 价格区间 */}
            <tr>
              <td className="row-label">价格区间</td>
              {compareList.map(device => (
                <td key={device.id} className={isDifferent('price', formatPrice(device.priceMin, device.priceMax)) ? 'different' : ''}>
                  {formatPrice(device.priceMin, device.priceMax)}
                </td>
              ))}
            </tr>

            {/* 核心用途 */}
            <tr>
              <td className="row-label">核心用途</td>
              {compareList.map(device => (
                <td key={device.id} className={isDifferent('summary', device.summary) ? 'different' : ''}>
                  {device.summary || '-'}
                </td>
              ))}
            </tr>

            {/* 关键参数 */}
            <tr>
              <td className="row-label">关键参数</td>
              {compareList.map(device => {
                const params = getKeyParams(device)
                return (
                  <td key={device.id}>
                    {params.length > 0 ? (
                      <ul className="key-params">
                        {params.map((param, index) => (
                          <li key={index}>
                            <span className="param-label">{param.label}：</span>
                            <span className="param-value">{param.value}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      '-'
                    )}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="compare-footer">
        <p className="hint">
          <span className="different-indicator"></span>
          表示该值与其他设备不同
        </p>
      </div>
    </div>
  )
}
