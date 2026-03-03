import { Link } from 'react-router-dom'
import './TermTooltip.css'

/**
 * 术语高亮组件
 * 显示医学术语的定义，鼠标悬停显示 Tooltip，点击跳转到 /glossary 页面
 */
export default function TermTooltip({ term, data, children }) {
  if (!data) {
    return <span>{children}</span>
  }

  const { chinese, definition } = data

  return (
    <Link
      to={`/glossary/${term}`}
      className="term-tooltip"
      title={`${chinese}: ${definition}`}
    >
      {children}
    </Link>
  )
}
