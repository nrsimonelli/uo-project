import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'
import { TeamProvider } from './components/team-builder/team-context'
import { ThemeProvider } from './components/theme-provider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <TeamProvider>
        <App />
      </TeamProvider>
    </ThemeProvider>
  </StrictMode>
)
