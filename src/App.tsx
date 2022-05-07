import React from 'react'
import styles from './app.module.less'
import { useNavigate } from 'react-router-dom'


function App() {
  const navigate = useNavigate();
  const jumpTo = () => {
    navigate('/particleEffects');
  }
  return (
    <div className={styles.appBox}>
      <div onClick={jumpTo}>点击进入粒子特效</div>
    </div>
  )
}

export default App
