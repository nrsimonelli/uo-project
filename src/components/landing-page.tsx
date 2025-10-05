import { UsersIcon, SwordIcon, ShieldIcon, TrendingUpIcon } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function LandingPage() {
  return (
    // Filler content for landing page... ignore
    <div className="space-y-16 pt-16">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Welcome to the{' '}
            <span className="text-primary">Unicorn Overlord</span> Project
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Enjoy comprehensive tools to help you build, manage, and test your
            teams against one another in battle.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" asChild>
              <Link to="/team-builder">Start Building Teams</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/equipment-builder">Manage Equipment</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything You Need to Excel
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Comprehensive tools to optimize your Unicorn Overlord experience
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <UsersIcon className="h-8 w-8 text-primary" />
                <CardTitle>Team Builder</CardTitle>
                <CardDescription>
                  Create and manage up to 6 teams of any unit compositions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/team-builder">Build Teams</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <SwordIcon className="h-8 w-8 text-primary" />
                <CardTitle>Equipment Manager</CardTitle>
                <CardDescription>
                  Optimize equipment loadouts and track gear across your teams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/equipment-builder">Manage Gear</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ShieldIcon className="h-8 w-8 text-primary" />
                <CardTitle>Class Analysis</CardTitle>
                <CardDescription>
                  Deep dive into class abilities, skills, and optimal builds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUpIcon className="h-8 w-8 text-primary" />
                <CardTitle>Battle Calculator</CardTitle>
                <CardDescription>
                  Calculate damage, effectiveness, and battle outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Ready to Play?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start team building and theory crafting today
          </p>
          <div className="mt-8">
            <Button size="lg" asChild>
              <Link to="/team-builder">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
