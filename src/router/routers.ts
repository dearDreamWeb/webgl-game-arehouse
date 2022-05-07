import React from 'react'

// 懒加载
const App = React.lazy(() => import("@/App"));
const ParticleEffects = React.lazy(() => import("@/pages/particleEffects/particleEffects"));

const routeConfig = [
    {
        path: '/',
        component: App,
    },
    {
        path: '/particleEffects',
        component: ParticleEffects,
    },
]

export default routeConfig