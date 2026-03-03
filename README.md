# 医疗设备采购研究平台

一个专注于医疗设备采购信息查询、价格比较和术语学习的综合性研究平台。

## 功能特性

- **设备浏览与搜索** - 支持68种医疗设备的分类浏览和关键词搜索
- **设备详情** - 查看设备的完整技术参数、价格区间和供应商信息
- **价格对比分析** - 对比不同设备的价格，生成可视化对比图表
- **术语学习** - 内置197个医疗设备相关术语，支持悬停查看解释
- **采购清单管理** - 创建和管理个人采购清单，计算总预算
- **设备对比** - 选择多个设备进行详细参数对比
- **响应式设计** - 支持桌面端和移动端访问

## 技术栈

### 前端框架
- [React 19](https://react.dev/) - 用户界面构建
- [React Router DOM 7](https://reactrouter.com/) - 路由管理
- [Vite 7](https://vitejs.dev/) - 构建工具和开发服务器

### 核心库
- [react-markdown](https://github.com/remarkjs/react-markdown) - Markdown 渲染
- [remark-gfm](https://github.com/remarkjs/remark-gfm) - GitHub Flavored Markdown 支持
- [gray-matter](https://github.com/jonschlinkert/gray-matter) - 前置元数据解析

### 开发工具
- [ESLint](https://eslint.org/) - 代码规范检查

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 [http://localhost:5173](http://localhost:5173) 查看应用。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 项目结构

```
website/
├── public/              # 静态资源
├── src/
│   ├── assets/          # 资源文件
│   ├── components/      # 可复用组件
│   │   ├── layout/     # 布局组件 (Header, Sidebar, Main)
│   │   ├── Loading.jsx
│   │   └── TermTooltip.jsx
│   ├── context/         # React Context 状态管理
│   │   ├── CompareContext.jsx
│   │   └── ProcurementContext.jsx
│   ├── pages/           # 页面组件
│   │   ├── Home.jsx        # 首页
│   │   ├── Devices.jsx     # 设备列表
│   │   ├── DeviceDetail.jsx # 设备详情
│   │   ├── Glossary.jsx    # 术语词典
│   │   ├── Compare.jsx     # 设备对比
│   │   ├── PriceComparison.jsx # 价格分析
│   │   └── ProcurementList.jsx # 采购清单
│   ├── App.jsx          # 根组件
│   ├── main.jsx         # 应用入口
│   └── index.css        # 全局样式
├── index.html           # HTML 模板
├── vite.config.js       # Vite 配置
└── package.json         # 项目配置
```

## 数据说明

### 设备数据
- **数量**: 68个医疗设备
- **分类**: 影像设备、检验设备、治疗设备、监护设备等
- **信息**: 设备名称、型号、厂商、价格区间、技术参数、适用场景等

### 术语数据
- **数量**: 197个专业术语
- **领域**: 医疗器械、影像技术、检验医学、生物工程等
- **格式**: 术语名称、解释说明、相关链接

## 截图

### 首页
[待添加首页截图]

### 设备列表
[待添加设备列表截图]

### 设备对比
[待添加设备对比截图]

### 术语词典
[待添加术语词典截图]

## 部署说明

### GitHub Pages 部署

项目已配置 GitHub Pages 自动部署，推送至 `main` 分支后自动触发部署。

部署地址: [待填写实际URL]

### 其他部署方式

项目构建产物为纯静态文件，可部署至任何静态托管平台：
- Vercel
- Netlify
- 阿里云 OSS
- 腾讯云 COS

## 许可证

[MIT](LICENSE)

---

Made with ❤️ for Medical Equipment Research
