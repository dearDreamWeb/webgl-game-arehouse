import { useState, useEffect } from 'react'
import styles from './App.module.less'

function App() {
  const [count, setCount] = useState("")
  useEffect(() => { 
  }, [])
  return (
    <div className={styles.app}>

    </div>
  )
}

export default App
