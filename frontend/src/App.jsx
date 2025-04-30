import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Leaderboard from './LeaderBoard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
       <Leaderboard />
       <p className="text-white text-center mb-4">
        Developed by{' '}
        <a
          href="https://www.linkedin.com/in/chokkalingam2005/"
          target="_blank"
          rel="noopener noreferrer"
         className="text-warning text-decoration-underline"
        >
          Chokkalingam S
        </a>
        , B.Tech. IT '2026, RMKEC © 2025
      </p>
    </>
  )
}

export default App
