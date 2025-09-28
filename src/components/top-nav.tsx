import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  // navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { useTheme } from '@/hooks/use-theme'
import { ContrastIcon, TrophyIcon } from 'lucide-react'
import { Button } from './ui/button'

export const TopNav = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div className='fixed top-0 w-full -translate-x-1/2 z-20 flex left-1/2 justify-center overscroll-contain pt-4 px-4'>
      <NavigationMenu className='px-8 py-4 backdrop-blur-sm bg-transparent bg-linear-to-br from-background/75 to-primary-foreground/90 flex justify-between max-w-6xl rounded-xl border'>
        <div className='inline-flex space-x-1 items-center'>
          <TrophyIcon className='h-8 w-8' />
          <p className='sm:block hidden'>Unicorn Overlord</p>
        </div>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className='text-muted-foreground hover:text-foreground hover:bg-initial transition-colors duration-200'
              // className={navigationMenuTriggerStyle()}
            >
              <a href='/'>Home</a>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className='text-muted-foreground hover:text-foreground hover:bg-initial transition-colors duration-200'

              // className={navigationMenuTriggerStyle()}
            >
              <a href='/'>Home</a>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className='text-muted-foreground hover:text-foreground hover:bg-initial transition-colors duration-200'

              // className={navigationMenuTriggerStyle()}
            >
              <a href='/'>Home</a>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <Button
            variant='ghost'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <ContrastIcon className='h-6 w-6' />
          </Button>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}
