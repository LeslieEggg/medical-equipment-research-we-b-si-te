import { createContext, useContext, useState, useEffect } from 'react'

const CompareContext = createContext(null)

export const CompareProvider = ({ children }) => {
  const [compareDevices, setCompareDevices] = useState(() => {
    // 从 localStorage 恢复
    const saved = localStorage.getItem('compareDevices')
    return saved ? JSON.parse(saved) : []
  })

  // 持久化到 localStorage
  useEffect(() => {
    localStorage.setItem('compareDevices', JSON.stringify(compareDevices))
  }, [compareDevices])

  const addToCompare = (device) => {
    setCompareDevices(prev => {
      if (prev.some(d => d.id === device.id)) {
        return prev
      }
      if (prev.length >= 4) {
        return prev
      }
      return [...prev, device]
    })
  }

  const removeFromCompare = (deviceId) => {
    setCompareDevices(prev => prev.filter(d => d.id !== deviceId))
  }

  const isInCompare = (deviceId) => {
    return compareDevices.some(d => d.id === deviceId)
  }

  const clearCompare = () => {
    setCompareDevices([])
  }

  return (
    <CompareContext.Provider
      value={{
        compareDevices,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare
      }}
    >
      {children}
    </CompareContext.Provider>
  )
}

export const useCompare = () => {
  const context = useContext(CompareContext)
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider')
  }
  return context
}
