import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { id: '影像诊断', name: '影像诊断', description: 'X线、超声、CT、MRI等', icon: '🩻' },
    { id: '手术设备', name: '手术设备', description: '手术灯、手术床、麻醉设备', icon: '🏥' },
    { id: '监护设备', name: '监护设备', description: '监护仪、呼吸机、输液泵', icon: '🫀' },
    { id: '透析设备', name: '透析设备', description: '血液透析机、水处理系统', icon: '💧' },
    { id: '产科设备', name: '产科设备', description: '胎监、新生儿设备', icon: '👶' },
    { id: '实验室设备', name: '实验室设备', description: '培养箱、显微镜、冷藏设备', icon: '🔬' },
    { id: 'IVF设备', name: 'IVF设备', description: '显微操作、胚胎培养设备', icon: '🧬' },
    { id: '辅助设备', name: '辅助设备', description: '输液泵、吸引器、病床', icon: '🛏️' },
    { id: '其他', name: '其他', description: '其他类别设备', icon: '📦' }
  ]

  const stats = [
    { value: '68', label: '医疗设备', icon: '🩺' },
    { value: '197', label: '医学术语', icon: '📚' },
    { value: '9', label: '分类体系', icon: '📂' }
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/devices?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleCategoryClick = (categoryId) => {
    navigate(`/devices?category=${categoryId}`)
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1 className="hero-title">医疗设备调研可视化</h1>
        <p className="hero-subtitle">为医学小白设计的医疗设备信息平台</p>

        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="搜索设备名称或用途..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              搜索
            </button>
          </div>
        </form>
      </div>

      <div className="stats-section">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="categories-section">
        <h2 className="section-title">按分类浏览</h2>
        <div className="categories-grid">
          {categories.map((category) => (
            <div
              key={category.id}
              className="category-card"
              onClick={() => handleCategoryClick(category.id)}
            >
              <div className="category-icon">{category.icon}</div>
              <h3 className="category-name">{category.name}</h3>
              <p className="category-description">{category.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="intro-section">
        <h2 className="section-title">关于本站</h2>
        <div className="intro-content">
          <p>
            这是一个专门为医学小白设计的医疗设备调研可视化网站。通过直观的界面展示各种医疗设备的基本信息、技术参数和临床应用，帮助非医学背景的人员快速了解医疗设备知识。
          </p>
        </div>
      </div>
    </div>
  )
}
