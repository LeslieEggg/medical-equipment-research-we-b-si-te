import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProcurement } from '../../context/ProcurementContext'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { getTotalCount } = useProcurement()
  const itemCount = getTotalCount()

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const closeMenu = () => {
    setMenuOpen(false)
  }

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          医疗设备研究
        </Link>

        {/* 汉堡菜单按钮 - 移动端显示 */}
        <button
          className="hamburger-button"
          onClick={toggleMenu}
          aria-label="菜单"
          aria-expanded={menuOpen}
        >
          <span className={`hamburger-icon ${menuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>首页</Link>
          <Link to="/devices" className="nav-link" onClick={closeMenu}>设备列表</Link>
          <Link to="/favorites" className="nav-link" onClick={closeMenu}>我的收藏</Link>
          <Link to="/glossary" className="nav-link" onClick={closeMenu}>术语表</Link>
          <Link to="/procurement" className="nav-link cart-link" onClick={closeMenu}>
            <span className="cart-icon">🛒</span>
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
        </nav>
      </div>
    </header>
  )
}
