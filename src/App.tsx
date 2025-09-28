import { Layout } from './components/layout'
import { TeamBuilder } from './components/team-builder/team-builder'
import { TopNav } from './components/top-nav'

export const App = () => {
  return (
    <Layout>
      <TopNav />
      {/* TODO: Routing */}
      <TeamBuilder />
    </Layout>
  )
}
