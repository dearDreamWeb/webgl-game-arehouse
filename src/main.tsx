import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import './global.less'
import { Route, Routes, HashRouter, Link } from 'react-router-dom'
import routeConfig from '@/router/routers'
const App = React.lazy(() => import("@/App"));
const ParticleEffects = React.lazy(() => import("@/pages/particleEffects/particleEffects"));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <Routes>
      {
        routeConfig.map((router) => {
          return <Route key={router.path} path={router.path} element={(
            <Suspense fallback={''}>
              <router.component />
            </Suspense>
          )} />
        })
      }
    </Routes>
  </HashRouter>
)
