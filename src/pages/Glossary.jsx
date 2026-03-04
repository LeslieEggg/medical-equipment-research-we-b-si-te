import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import './Glossary.css'

export default function Glossary() {
  const { term } = useParams()
  const [glossaryData, setGlossaryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')

  useEffect(() => {
    const loadGlossaryData = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/glossary.json`)
        if (!response.ok) {
          throw new Error('加载术语数据失败')
        }
        const data = await response.json()
        setGlossaryData(data)
      } catch (err) {
        console.error(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadGlossaryData()
  }, [])

  // 获取所有分类
  const categories = useMemo(() => {
    if (!glossaryData) return []
    const cats = new Set(Object.values(glossaryData).map(t => t.category))
    return ['全部', ...Array.from(cats).sort()]
  }, [glossaryData])

  // 获取筛选后的术语列表
  const filteredTerms = useMemo(() => {
    if (!glossaryData) return []

    return Object.entries(glossaryData)
      .filter(([key, value]) => {
        const matchesSearch = searchTerm === '' ||
          key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          value.chinese.includes(searchTerm) ||
          value.definition.includes(searchTerm)
        const matchesCategory = selectedCategory === '全部' || value.category === selectedCategory
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => a[0].localeCompare(b[0]))
  }, [glossaryData, searchTerm, selectedCategory])

  // 查找特定术语
  const termDetail = useMemo(() => {
    if (!glossaryData || !term) return null
    return glossaryData[term.toUpperCase()] || null
  }, [glossaryData, term])

  if (loading) {
    return <div className="page glossary-page">加载中...</div>
  }

  // 显示术语详情
  if (term && termDetail) {
    return (
      <div className="page glossary-page">
        <button
          className="back-button"
          onClick={() => window.history.back()}
        >
          &larr; 返回术语表
        </button>
        <div className="term-detail">
          <div className="term-header">
            <h1 className="term-title">{term.toUpperCase()}</h1>
            <span className={`term-importance importance-${termDetail.importance}`}>
              {termDetail.importance}
            </span>
          </div>
          <div className="term-english">{termDetail.english}</div>
          <div className="term-chinese">{termDetail.chinese}</div>
          <div className="term-definition">{termDetail.definition}</div>
          <div className="term-meta">
            <span className="term-category">分类：{termDetail.category}</span>
          </div>
        </div>
      </div>
    )
  }

  // 显示术语列表
  return (
    <div className="page glossary-page">
      <h1>术语表</h1>

      {/* 搜索和筛选 */}
      <div className="glossary-controls">
        <input
          type="text"
          placeholder="搜索术语..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* 术语列表 */}
      <div className="glossary-list">
        {filteredTerms.map(([key, value]) => (
          <div key={key} className="glossary-item">
            <div className="term-header">
              <h3 className="term-name">{key}</h3>
              <span className={`term-importance importance-${value.importance}`}>
                {value.importance}
              </span>
            </div>
            <div className="term-english">{value.english}</div>
            <div className="term-chinese">{value.chinese}</div>
            <div className="term-definition">{value.definition}</div>
            <div className="term-meta">
              <span className="term-category">{value.category}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <div className="no-results">没有找到匹配的术语</div>
      )}
    </div>
  )
}
