import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProcurement } from '../context/ProcurementContext'
import './ProcurementList.css'

export default function ProcurementList() {
  const { items, removeItem, clearList, updateQuantity, getTotalBudget } = useProcurement()
  const totalBudget = getTotalBudget()
  const [copySuccess, setCopySuccess] = useState(false)

  const formatPriceRange = (min, max) => {
    if (min === null || max === null) {
      return '价格待定'
    }
    if (min === max) {
      return `${min}万元`
    }
    return `${min}-${max}万元`
  }

  const formatTotalPrice = (min, max, quantity) => {
    if (min === null || max === null) {
      return '价格待定'
    }
    if (min === max) {
      return `${min * quantity}万元`
    }
    return `${min * quantity}-${max * quantity}万元`
  }

  const handleQuantityChange = (id, value) => {
    const quantity = parseInt(value)
    if (quantity >= 1 && quantity <= 100) {
      updateQuantity(id, quantity)
    }
  }

  const formatDate = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const exportToJSON = () => {
    const exportData = items.map(item => ({
      设备ID: item.id,
      设备名称: item.name,
      分类: item.categories.join(', '),
      价格区间: formatPriceRange(item.priceMin, item.priceMax),
      数量: item.quantity
    }))

    const jsonStr = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `procurement-list-${formatDate()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportToCSV = () => {
    const headers = ['设备名称', '分类', '价格区间', '数量', '备注']
    const rows = items.map(item => [
      `"${item.name}"`,
      `"${item.categories.join(', ')}"`,
      `"${formatPriceRange(item.priceMin, item.priceMax)}"`,
      item.quantity,
      '""'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `procurement-list-${formatDate()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async () => {
    const exportData = items.map(item => ({
      设备ID: item.id,
      设备名称: item.name,
      分类: item.categories.join(', '),
      价格区间: formatPriceRange(item.priceMin, item.priceMax),
      数量: item.quantity
    }))

    const jsonStr = JSON.stringify(exportData, null, 2)
    try {
      await navigator.clipboard.writeText(jsonStr)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  return (
    <div className="procurement-page">
      <div className="procurement-header">
        <h1>采购清单</h1>
        <div className="procurement-actions">
          {items.length > 0 && (
            <>
              <button className="export-btn" onClick={exportToJSON} title="导出为JSON">
                📄 JSON
              </button>
              <button className="export-btn" onClick={exportToCSV} title="导出为CSV">
                📊 CSV
              </button>
              <button className="export-btn" onClick={copyToClipboard} title="复制到剪贴板">
                📋 复制
              </button>
              <button className="clear-btn" onClick={clearList}>
                清空清单
              </button>
            </>
          )}
          <Link to="/devices" className="continue-btn">
            继续添加设备
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h2>采购清单为空</h2>
          <p>您还没有添加任何设备到采购清单</p>
          <Link to="/devices" className="add-devices-btn">
            浏览设备
          </Link>
        </div>
      ) : (
        <>
          <div className="budget-summary">
            <div className="budget-card">
              <span className="budget-label">设备数量</span>
              <span className="budget-value">{items.length} 种</span>
            </div>
            <div className="budget-card">
              <span className="budget-label">总数量</span>
              <span className="budget-value">{items.reduce((sum, item) => sum + item.quantity, 0)} 台</span>
            </div>
            <div className="budget-card highlight">
              <span className="budget-label">预估总预算</span>
              <span className="budget-value">{formatPriceRange(totalBudget.min, totalBudget.max)}</span>
            </div>
          </div>

          {copySuccess && (
            <div className="copy-success">
              ✓ 已复制到剪贴板
            </div>
          )}

          <div className="procurement-list">
            <div className="list-header">
              <div className="header-product">设备信息</div>
              <div className="header-price">单价区间</div>
              <div className="header-quantity">数量</div>
              <div className="header-total">小计</div>
              <div className="header-action"></div>
            </div>

            {items.map(item => (
              <div key={item.id} className="list-item">
                <div className="item-product">
                  <Link to={`/device/${item.id}`} className="item-name">
                    {item.name}
                  </Link>
                  <div className="item-categories">
                    {item.categories.map((cat, index) => (
                      <span key={index} className="category-tag">{cat}</span>
                    ))}
                  </div>
                </div>
                <div className="item-price">
                  {formatPriceRange(item.priceMin, item.priceMax)}
                </div>
                <div className="item-quantity">
                  <button
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    min="1"
                    max="100"
                    className="quantity-input"
                  />
                  <button
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= 100}
                  >
                    +
                  </button>
                </div>
                <div className="item-total">
                  {formatTotalPrice(item.priceMin, item.priceMax, item.quantity)}
                </div>
                <div className="item-action">
                  <button
                    className="remove-btn"
                    onClick={() => removeItem(item.id)}
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
