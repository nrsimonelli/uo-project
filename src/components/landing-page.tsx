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
    <div className="pt-16 space-y-16">
      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Welcome to the{' '}
            <span className="text-primary">Unicorn Overlord</span> Project
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Enjoy comprehensive tools to help you build, manage, and test your
            teams against one another in battle.
          </p>
          <div className="flex items-center justify-center mt-10 gap-x-6">
            <Button size="lg" asChild>
              <Link to="/team-builder">Start Building Teams</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/mock-battle">Battle Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything You Need to Excel
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Comprehensive tools to optimize your Unicorn Overlord experience
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 mt-16 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <UsersIcon className="w-8 h-8 text-primary" />
                <CardTitle>Team Builder</CardTitle>
                <CardDescription>
                  Create and manage multiple teams of any unit compositions
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
                <SwordIcon className="w-8 h-8 text-primary" />
                <CardTitle>Equipment Viewer</CardTitle>
                <CardDescription>
                  Check out all equippable items and their details by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/equipment">View Equipment</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ShieldIcon className="w-8 h-8 text-primary" />
                <CardTitle>Class Analysis</CardTitle>
                <CardDescription>
                  Deep dive into class stats, growths, and traits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm">
                  <Link to="/equipment">Unit Data</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUpIcon className="w-8 h-8 text-primary" />
                <CardTitle>Battle</CardTitle>
                <CardDescription>
                  Simulate a full match between two teams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm">
                  <Link to="/mock-battle">Battle</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
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
