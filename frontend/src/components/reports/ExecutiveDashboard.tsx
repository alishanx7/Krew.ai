import { motion } from 'framer-motion'
import { Cell, Pie, PieChart, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import type { Report } from '../../types'

const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe']

interface ScoreRingProps {
  label: string
  value: number
  color: string
}

function ScoreRing({ label, value, color }: ScoreRingProps) {
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-28 w-28">
        <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{value}</span>
        </div>
      </div>
      <span className="mt-2 text-sm text-zinc-400">{label}</span>
    </div>
  )
}

interface ExecutiveDashboardProps {
  report: Report
}

export function ExecutiveDashboard({ report }: ExecutiveDashboardProps) {
  const scores = report.scores || {}
  const revenue = report.chart_data?.revenue || []
  const marketShare = report.chart_data?.market_share || []

  const sections = [
    { title: 'Executive Summary', content: report.executive_summary },
    { title: 'Market Analysis', content: report.market_analysis },
    { title: 'Competitor Analysis', content: report.competitor_analysis },
    { title: 'Business Strategy', content: report.business_strategy },
    { title: 'Marketing Plan', content: report.marketing_plan },
    { title: 'Financial Projection', content: report.financial_projection },
    { title: 'Technical Architecture', content: report.technical_architecture },
    { title: 'Roadmap', content: report.roadmap },
    { title: 'Risks', content: report.risks },
    { title: 'Recommendations', content: report.recommendations },
    { title: 'Next Steps', content: report.next_steps },
  ]

  return (
    <div className="space-y-6">
      {/* Scores */}
      <Card glow>
        <CardHeader>
          <CardTitle>Business Intelligence Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-around py-4">
            <ScoreRing label="Business Score" value={scores.business ?? 0} color="#6366f1" />
            <ScoreRing label="Risk Score" value={scores.risk ?? 0} color="#f59e0b" />
            <ScoreRing label="Opportunity Score" value={scores.opportunity ?? 0} color="#10b981" />
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {revenue.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Revenue Projection ($K)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenue}>
                  <XAxis dataKey="year" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
        {marketShare.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Market Share Analysis</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={marketShare} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {marketShare.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Timeline */}
      {report.timeline?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Execution Timeline</CardTitle></CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />
              <div className="space-y-6">
                {report.timeline.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="relative pl-10"
                  >
                    <div className={`absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2 ${
                      item.status === 'completed' ? 'bg-emerald-400 border-emerald-400' :
                      item.status === 'in_progress' ? 'bg-krew-500 border-krew-500 animate-pulse' :
                      'bg-zinc-700 border-zinc-600'
                    }`} />
                    <div>
                      <p className="font-medium text-white">{item.phase}</p>
                      <p className="text-sm text-zinc-400">{item.start} — {item.end}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Sections */}
      {sections.map((section, i) => section.content && (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card hover>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert prose-sm max-w-none text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {section.content}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
