import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { TeamProvider } from './components/team-builder/team-context'
import { ThemeProvider } from './components/theme-provider'
import { BrowserRouter } from 'react-router'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        <TeamProvider>
          <App />
        </TeamProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)
