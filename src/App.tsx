import { TeamBuilder } from './components/team-builder/team-builder'
import { Button } from './components/ui/button'
import { useTheme } from './hooks/use-theme'

export const App = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div>
      <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        Theme
      </Button>
      <TeamBuilder />
    </div>
  )
}
