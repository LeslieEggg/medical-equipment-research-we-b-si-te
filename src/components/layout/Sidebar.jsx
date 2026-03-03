import { Link } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <h3 className="sidebar-title">导航</h3>
          <ul className="sidebar-links">
            <li><Link to="/" className="sidebar-link">首页</Link></li>
            <li><Link to="/devices" className="sidebar-link">设备列表</Link></li>
            <li><Link to="/compare" className="sidebar-link">设备对比</Link></li>
            <li><Link to="/price-comparison" className="sidebar-link">价格对比</Link></li>
            <li><Link to="/glossary" className="sidebar-link">术语表</Link></li>
          </ul>
        </div>
      </nav>
    </aside>
  )
}
