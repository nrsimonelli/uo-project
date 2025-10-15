import { BowArrowIcon, ContrastIcon } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  // navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { useTheme } from '@/hooks/use-theme'

export function TopNav() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="fixed top-0 w-full -translate-x-1/2 z-20 flex left-1/2 justify-center overscroll-contain pt-4 px-4">
      <NavigationMenu className="px-8 py-4 backdrop-blur-sm bg-transparent bg-linear-to-br from-background/75 to-card/90 flex justify-between max-w-6xl rounded-xl border">
        <div className="inline-flex space-x-1 items-center">
          <BowArrowIcon className="h-8 w-8" />
          <p className="sm:block hidden">UO Project</p>
        </div>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className="text-muted-foreground hover:text-foreground hover:bg-initial transition-colors duration-200"
            >
              <Link to="/">Home</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className="text-muted-foreground hover:text-foreground hover:bg-initial transition-colors duration-200"
            >
              <Link to="/team-builder">Team Builder</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className="text-muted-foreground hover:text-foreground hover:bg-initial transition-colors duration-200"
            >
              <Link to="/equipment-builder">Equipment Builder</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className="text-muted-foreground hover:text-foreground hover:bg-initial transition-colors duration-200"
            >
              <Link to="/classes">Unit Data</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className="text-muted-foreground hover:text-foreground hover:bg-initial transition-colors duration-200"
            >
              <Link to="/mock-battle">Mock Battle</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <Button
            variant="ghost"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <ContrastIcon className="h-6 w-6" />
          </Button>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}
