import { Bot, Search, DollarSign, Megaphone, Code, Briefcase, ShieldCheck } from 'lucide-react'
import { AppLayout } from '../components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'

const agents = [
  { name: 'Research Agent', icon: Search, color: 'from-blue-500 to-cyan-500', desc: 'Market research, industry trends, and audience analysis' },
  { name: 'Finance Agent', icon: DollarSign, color: 'from-emerald-500 to-teal-500', desc: 'Financial projections, revenue models, and ROI analysis' },
  { name: 'Marketing Agent', icon: Megaphone, color: 'from-pink-500 to-rose-500', desc: 'Growth strategies, channels, and brand positioning' },
  { name: 'Software Architecture Agent', icon: Code, color: 'from-violet-500 to-purple-500', desc: 'Technical stack, scalability, and system design' },
  { name: 'Business Strategy Agent', icon: Briefcase, color: 'from-amber-500 to-orange-500', desc: 'Business models, competitive positioning, GTM strategy' },
  { name: 'Quality Assurance Agent', icon: ShieldCheck, color: 'from-red-500 to-pink-500', desc: 'Risk assessment, gap analysis, and quality review' },
]

export default function AgentsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Agents</h1>
          <p className="mt-1 text-zinc-400">Specialist agents coordinated by the Orchestrator</p>
        </div>

        <Card glow>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-krew-500 to-krew-700">
                <Bot className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Orchestrator Agent</h2>
                <p className="text-zinc-400">Coordinates all specialist agents, synthesizes outputs into executive reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Card key={agent.name} hover>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${agent.color}`}>
                    <agent.icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-base">{agent.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-400">{agent.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
