import React from 'react'

// 懒加载
const App = React.lazy(() => import("@/App"));
const ParticleEffects = React.lazy(() => import("@/pages/particleEffects/particleEffects"));
const Breakout = React.lazy(() => import("@/pages/breakout/breakout"));

const routeConfig = [
    {
        path: '/',
        component: Breakout,
    },
    {
        path: '/particleEffects',
        component: ParticleEffects,
    },
]

export default routeConfig