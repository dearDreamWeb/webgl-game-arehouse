import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import './global.less'
import { Route, Routes, HashRouter, Link } from 'react-router-dom'
import routeConfig from '@/router/routers'

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
