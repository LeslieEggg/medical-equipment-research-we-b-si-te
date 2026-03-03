import { createContext, useContext, useState, useEffect } from 'react'

// 创建 Context
const ProcurementContext = createContext(null)

// 自定义 Hook
export const useProcurement = () => {
  const context = useContext(ProcurementContext)
  if (!context) {
    throw new Error('useProcurement must be used within ProcurementProvider')
  }
  return context
}

// Provider 组件
export const ProcurementProvider = ({ children }) => {
  const [items, setItems] = useState([])

  // 从 localStorage 加载数据
  useEffect(() => {
    const saved = localStorage.getItem('procurement-list')
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse procurement list:', e)
      }
    }
  }, [])

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem('procurement-list', JSON.stringify(items))
  }, [items])

  // 添加设备到清单
  const addItem = (device, quantity = 1) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === device.id)
      if (existingIndex !== -1) {
        // 更新数量
        const updated = [...prev]
        updated[existingIndex].quantity = Math.min(100, updated[existingIndex].quantity + quantity)
        return updated
      }
      // 添加新项
      return [...prev, {
        id: device.id,
        name: device.name,
        categories: device.categories,
        priceMin: device.priceMin,
        priceMax: device.priceMax,
        quantity
      }]
    })
  }

  // 更新设备数量
  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.min(100, quantity) } : item
    ))
  }

  // 删除单个设备
  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  // 清空清单
  const clearList = () => {
    setItems([])
  }

  // 获取总预算
  const getTotalBudget = () => {
    if (items.length === 0) return { min: 0, max: 0 }
    const minTotal = items.reduce((sum, item) => sum + (item.priceMin || 0) * item.quantity, 0)
    const maxTotal = items.reduce((sum, item) => sum + (item.priceMax || 0) * item.quantity, 0)
    return { min: minTotal, max: maxTotal }
  }

  // 获取清单总数
  const getTotalCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }

  const value = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearList,
    getTotalBudget,
    getTotalCount
  }

  return (
    <ProcurementContext.Provider value={value}>
      {children}
    </ProcurementContext.Provider>
  )
}
