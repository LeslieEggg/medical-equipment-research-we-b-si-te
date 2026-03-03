import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProcurementProvider } from './context/ProcurementContext'
import { CompareProvider } from './context/CompareContext'
import { FavoritesProvider } from './context/FavoritesContext'
import Main from './components/layout/Main'
import Home from './pages/Home'
import Devices from './pages/Devices'
import Glossary from './pages/Glossary'
import Loading from './components/Loading'

// 懒加载非关键页面
const DeviceDetail = lazy(() => import('./pages/DeviceDetail'))
const ProcurementList = lazy(() => import('./pages/ProcurementList'))
const Compare = lazy(() => import('./pages/Compare'))
const PriceComparison = lazy(() => import('./pages/PriceComparison'))
const Favorites = lazy(() => import('./pages/Favorites'))

function App() {
  return (
    <ProcurementProvider>
      <CompareProvider>
        <FavoritesProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Main />}>
                <Route index element={<Home />} />
                <Route path="devices" element={<Devices />} />
                <Route path="device/:id" element={
                  <Suspense fallback={<Loading />}>
                    <DeviceDetail />
                  </Suspense>
                } />
                <Route path="glossary" element={<Glossary />} />
                <Route path="glossary/:term" element={<Glossary />} />
                <Route path="procurement" element={
                  <Suspense fallback={<Loading />}>
                    <ProcurementList />
                  </Suspense>
                } />
                <Route path="compare" element={
                  <Suspense fallback={<Loading />}>
                    <Compare />
                  </Suspense>
                } />
                <Route path="price-comparison" element={
                  <Suspense fallback={<Loading />}>
                    <PriceComparison />
                  </Suspense>
                } />
                <Route path="favorites" element={
                  <Suspense fallback={<Loading />}>
                    <Favorites />
                  </Suspense>
                } />
              </Route>
            </Routes>
          </BrowserRouter>
        </FavoritesProvider>
      </CompareProvider>
    </ProcurementProvider>
  )
}

export default App
