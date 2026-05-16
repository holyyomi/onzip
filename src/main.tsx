import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './app/App'
import { resetLocalDataForFreshStart, runSeed } from './data/seed'

resetLocalDataForFreshStart()
runSeed()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
