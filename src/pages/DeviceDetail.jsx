import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import TermTooltip from '../components/TermTooltip'
import { useProcurement } from '../context/ProcurementContext'
import { useFavorites } from '../context/FavoritesContext'
import './DeviceDetail.css'

export default function DeviceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useProcurement()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [device, setDevice] = useState(null)
  const [markdownContent, setMarkdownContent] = useState('')
  const [glossaryData, setGlossaryData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeSection, setActiveSection] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [showQuantityInput, setShowQuantityInput] = useState(false)
  const [addedMessage, setAddedMessage] = useState(false)
  const [favoriteMessage, setFavoriteMessage] = useState('')

  useEffect(() => {
    const loadDeviceData = async () => {
      try {
        setLoading(true)

        // 加载术语数据
        const glossaryResponse = await fetch(`${import.meta.env.BASE_URL}data/glossary.json`)
        if (glossaryResponse.ok) {
          const glossary = await glossaryResponse.json()
          setGlossaryData(glossary)
        }

        // 加载设备列表
        const devicesResponse = await fetch(`${import.meta.env.BASE_URL}data/devices.json`)
        if (!devicesResponse.ok) {
          throw new Error('加载设备数据失败')
        }
        const devices = await devicesResponse.json()

        // 查找对应设备
        const foundDevice = devices.find(d => d.id === parseInt(id))
        if (!foundDevice) {
          setError('设备不存在')
          return
        }
        setDevice(foundDevice)

        // 加载 Markdown 报告
        const markdownResponse = await fetch(`/deep-research-reports/${foundDevice.file}`)
        if (!markdownResponse.ok) {
          throw new Error('加载报告失败')
        }
        const content = await markdownResponse.text()
        setMarkdownContent(content)

      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDeviceData()
  }, [id])

  // 获取所有术语关键词
  const terms = glossaryData ? Object.keys(glossaryData) : []

  // 按长度降序排序，确保优先匹配更长的术语
  const sortedTerms = terms.sort((a, b) => b.length - a.length)

  // 识别并替换文本中的术语
  const highlightTerms = (text) => {
    if (!text || !glossaryData || sortedTerms.length === 0) {
      return text
    }

    // 转义正则表达式中的特殊字符
    const escapeRegExp = (string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    // 构建正则表达式，匹配术语（考虑大小写、单词边界）
    // 避免在代码块、链接或其他特殊上下文中匹配
    const pattern = new RegExp(
      `\\b(${sortedTerms.map(escapeRegExp).join('|')})\\b`,
      'g'
    )

    // 分割文本并高亮术语
    const parts = text.split(pattern)

    return parts.map((part, index) => {
      if (part && glossaryData[part]) {
        return (
          <TermTooltip
            key={index}
            term={part}
            data={glossaryData[part]}
          >
            {part}
          </TermTooltip>
        )
      }
      return part
    })
  }

  // 解析 Markdown 中的标题生成目录
  const tableOfContents = useMemo(() => {
    if (!markdownContent) return []

    const lines = markdownContent.split('\n')
    const toc = []

    // 查找目录部分（以"## 目录"开头到"---"结束）
    let inTocSection = false
    for (const line of lines) {
      if (line.trim() === '## 目录') {
        inTocSection = true
        continue
      }
      if (inTocSection && line.trim() === '---') {
        break
      }
      if (inTocSection && line.trim().startsWith('- [')) {
        const match = line.match(/\[(.*?)\]\(#(.*?)\)/)
        if (match) {
          toc.push({
            title: match[1],
            id: match[2]
          })
        }
      }
    }

    return toc
  }, [markdownContent])

  // 监听滚动，高亮当前章节
  useEffect(() => {
    const handleScroll = () => {
      const sections = tableOfContents.map(item => document.getElementById(item.id))
      const scrollPos = window.scrollY + 100

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section && section.offsetTop <= scrollPos) {
          setActiveSection(tableOfContents[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [tableOfContents])

  const handleTocClick = (e, sectionId) => {
    e.preventDefault()
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setActiveSection(sectionId)
    }
  }

  const formatPrice = (min, max) => {
    if (min === null || max === null) {
      return '价格待定'
    }
    if (min === max) {
      return `${min}万元`
    }
    return `${min}-${max}万元`
  }

  const handleAddToProcurement = () => {
    if (device && quantity >= 1 && quantity <= 100) {
      addItem(device, quantity)
      setAddedMessage(true)
      setShowQuantityInput(false)
      setQuantity(1)
      setTimeout(() => setAddedMessage(false), 2000)
    }
  }

  const handleToggleFavorite = () => {
    if (device) {
      toggleFavorite(device.id)
      setFavoriteMessage(isFavorite(device.id) ? '已取消收藏' : '已添加到收藏')
      setTimeout(() => setFavoriteMessage(''), 2000)
    }
  }

  const handleQuantityChange = (value) => {
    const num = parseInt(value)
    if (num >= 1 && num <= 100) {
      setQuantity(num)
    }
  }

  if (loading) {
    return (
      <div className="device-detail-page">
        <div className="loading">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="device-detail-page">
        <button className="back-button" onClick={() => navigate('/devices')}>
          <span>&larr; 返回列表</span>
        </button>
        <div className="error-message">
          <h2>404</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="device-detail-page">
      <button className="back-button" onClick={() => navigate('/devices')}>
        <span>&larr; 返回列表</span>
      </button>

      {/* 设备基本信息卡片 */}
      <div className="device-info-card">
        <h1 className="device-name">{device.name}</h1>
        <div className="device-meta">
          <div className="meta-item">
            <span className="meta-label">分类：</span>
            <div className="category-tags">
              {device.categories.map((cat, index) => (
                <span key={index} className="category-tag">{cat}</span>
              ))}
            </div>
          </div>
          <div className="meta-item">
            <span className="meta-label">价格区间：</span>
            <span className="meta-value price-value">{formatPrice(device.priceMin, device.priceMax)}</span>
          </div>
        </div>
        <p className="device-summary">{device.summary}</p>

        {/* 添加到采购清单 */}
        <div className="procurement-actions">
          {favoriteMessage && (
            <div className="favorite-message">
              {favoriteMessage}
            </div>
          )}
          {addedMessage ? (
            <div className="added-message">
              已添加到采购清单
            </div>
          ) : showQuantityInput ? (
            <div className="quantity-selector">
              <label htmlFor="quantity-input">数量：</label>
              <input
                id="quantity-input"
                type="number"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                min="1"
                max="100"
                className="quantity-input"
              />
              <button className="btn-confirm" onClick={handleAddToProcurement}>
                确认添加
              </button>
              <button className="btn-cancel" onClick={() => { setShowQuantityInput(false); setQuantity(1); }}>
                取消
              </button>
            </div>
          ) : (
            <>
              <button className="btn-favorite" onClick={handleToggleFavorite}>
                {device && isFavorite(device.id) ? '❤️ 已收藏' : '🤍 收藏'}
              </button>
              <button className="btn-add-procurement" onClick={() => setShowQuantityInput(true)}>
                添加到采购清单
              </button>
            </>
          )}
          <Link to="/procurement" className="btn-view-list">
            查看采购清单
          </Link>
          <Link to="/favorites" className="btn-view-favorites">
            查看收藏
          </Link>
        </div>
      </div>

      {/* 主体内容区域 */}
      <div className="detail-content">
        {/* 左侧目录导航 */}
        {tableOfContents.length > 0 && (
          <aside className="toc-sidebar">
            <h3 className="toc-title">目录</h3>
            <nav className="toc-nav">
              <ul className="toc-list">
                {tableOfContents.map(item => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`toc-link ${activeSection === item.id ? 'active' : ''}`}
                      onClick={(e) => handleTocClick(e, item.id)}
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}

        {/* 右侧 Markdown 内容 */}
        <main className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // 自定义标题样式 - 不处理术语高亮（标题通常不含需要解释的术语）
              h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
              h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
              h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
              h4: ({ children, ...props }) => <h4 {...props}>{children}</h4>,
              // 自定义段落样式 - 添加术语高亮
              p: ({ children, ...props }) => {
                if (typeof children === 'string') {
                  return <p {...props}>{highlightTerms(children)}</p>
                }
                // 处理 children 为数组的情况
                const processedChildren = Array.isArray(children)
                  ? children.map(child => {
                      if (typeof child === 'string') {
                        return highlightTerms(child)
                      }
                      return child
                    })
                  : children
                return <p {...props}>{processedChildren}</p>
              },
              // 自定义列表样式 - 添加术语高亮
              li: ({ children, ...props }) => {
                const processLiChildren = (item) => {
                  if (typeof item === 'string') {
                    return highlightTerms(item)
                  }
                  if (Array.isArray(item)) {
                    return item.map(child => {
                      if (typeof child === 'string') {
                        return highlightTerms(child)
                      }
                      return child
                    })
                  }
                  return item
                }
                return <li {...props}>{processLiChildren(children)}</li>
              },
              ul: ({ node, ...props }) => <ul {...props} />,
              ol: ({ node, ...props }) => <ol {...props} />,
              // 自定义链接样式 - 不处理术语高亮（已有链接）
              a: ({ children, ...props }) => <a {...props}>{children}</a>,
              // 自定义代码块样式 - 不处理术语高亮
              code: ({ node, inline, children, ...props }) =>
                inline ? <code {...props}>{children}</code> : <code {...props}>{children}</code>,
              pre: ({ node, ...props }) => <pre {...props} />,
              // 自定义表格样式 - 添加术语高亮到单元格内容
              th: ({ children, ...props }) => {
                if (typeof children === 'string') {
                  return <th {...props}>{highlightTerms(children)}</th>
                }
                return <th {...props}>{children}</th>
              },
              td: ({ children, ...props }) => {
                if (typeof children === 'string') {
                  return <td {...props}>{highlightTerms(children)}</td>
                }
                return <td {...props}>{children}</td>
              },
              table: ({ node, ...props }) => <div className="table-wrapper"><table {...props} /></div>,
              thead: ({ node, ...props }) => <thead {...props} />,
              tbody: ({ node, ...props }) => <tbody {...props} />,
              tr: ({ node, ...props }) => <tr {...props} />,
              // 自定义引用样式 - 添加术语高亮
              blockquote: ({ children, ...props }) => {
                if (typeof children === 'string') {
                  return <blockquote {...props}>{highlightTerms(children)}</blockquote>
                }
                return <blockquote {...props}>{children}</blockquote>
              },
              // 自定义分隔线
              hr: ({ node, ...props }) => <hr {...props} />,
            }}
          >
            {markdownContent}
          </ReactMarkdown>
        </main>
      </div>
    </div>
  )
}
