export interface User {
  id: string
  email: string
  full_name: string
  company?: string
  role?: string
  avatar_url?: string
  theme: string
  created_at: string
}

export interface Project {
  id: string
  business_name: string
  industry: string
  problem_statement: string
  goals: string
  budget: string
  deadline: string
  status: 'draft' | 'generating' | 'completed' | 'failed'
  document_context?: string
  created_at: string
  updated_at: string
}

export interface AgentRun {
  id: string
  agent_key: string
  agent_name: string
  status: 'waiting' | 'running' | 'completed' | 'failed'
  output?: string
  error?: string
  order_index: number
}

export interface Report {
  id: string
  project_id: string
  executive_summary: string
  market_analysis: string
  competitor_analysis: string
  business_strategy: string
  marketing_plan: string
  financial_projection: string
  technical_architecture: string
  roadmap: string
  risks: string
  recommendations: string
  next_steps: string
  scores: { business?: number; risk?: number; opportunity?: number }
  chart_data: {
    revenue?: { year: string; value: number }[]
    market_share?: { name: string; value: number }[]
  }
  timeline: { phase: string; start: string; end: string; status: string }[]
  created_at: string
}

export interface ProjectDetail extends Project {
  agent_runs: AgentRun[]
  report?: Report
}

export interface Document {
  id: string
  filename: string
  file_type: string
  file_size: number
  project_id?: string
  created_at: string
}

export interface DashboardStats {
  total_projects: number
  completed_projects: number
  active_agents: number
  total_documents: number
}

export interface StreamEvent {
  type: string
  agent_key?: string
  agent_name?: string
  status?: string
  chunk?: string
  message?: string
  error?: string
  scores?: Record<string, number>
}
