import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, CheckSquare, FolderKanban, ListTodo, AlertTriangle, Users, Radio, CalendarDays, Globe, Target, ArrowRight } from 'lucide-react'
import { cn } from '../lib/cn'
import { decisions, projects, actions, risks, signals, stakeholders, markets, meetings, strategicPriorities } from '../data/mockData'

interface Result {
  id: string
  label: string
  sublabel: string
  category: string
  icon: typeof Search
  href: string
  badge?: string
  badgeCls?: string
}

function buildIndex(): Result[] {
  const results: Result[] = []

  decisions.forEach(d => results.push({
    id: d.id, label: d.title, sublabel: `Due ${d.deadline.slice(5).replace('-','/')} · Owner: ${d.owner}`,
    category: 'Decisions', icon: CheckSquare, href: '/decisions',
    badge: d.status === 'open' ? 'Open' : d.status, badgeCls: d.status === 'open' ? 'badge-open' : 'badge-parked',
  }))

  projects.forEach(p => results.push({
    id: p.id, label: p.name, sublabel: `Lead: ${p.lead} · ${p.milestoneDate}`,
    category: 'Projects', icon: FolderKanban, href: '/projects',
    badge: p.health, badgeCls: p.health === 'on-track' ? 'badge-track' : p.health === 'at-risk' ? 'badge-risk' : 'badge-watch',
  }))

  actions.filter(a => a.status === 'overdue' || a.status === 'open').forEach(a => results.push({
    id: a.id, label: a.title, sublabel: `Owner: ${a.owner} · Due ${a.dueDate.slice(5).replace('-','/')}`,
    category: 'Actions', icon: ListTodo, href: '/actions',
    badge: a.status === 'overdue' ? 'Overdue' : 'Open',
    badgeCls: a.status === 'overdue' ? 'badge-risk' : 'badge-watch',
  }))

  risks.forEach(r => results.push({
    id: r.id, label: r.title, sublabel: `${r.category} · ${r.market}`,
    category: 'Risks', icon: AlertTriangle, href: '/risks',
    badge: r.exposure === 'critical' ? 'Critical' : r.exposure === 'at-risk' ? 'High' : 'Medium',
    badgeCls: r.exposure === 'critical' ? 'badge-crit' : r.exposure === 'at-risk' ? 'badge-risk' : 'badge-watch',
  }))

  stakeholders.forEach(s => results.push({
    id: s.id, label: s.name, sublabel: `${s.role} · ${s.function}`,
    category: 'Stakeholders', icon: Users, href: '/stakeholders',
    badge: s.health === 'needs-attention' ? 'Needs Attention' : s.health,
    badgeCls: s.health === 'needs-attention' ? 'badge-risk' : s.health === 'watch' ? 'badge-watch' : 'badge-track',
  }))

  signals.forEach(s => results.push({
    id: s.id, label: s.signal, sublabel: `${s.category} · ${s.market}`,
    category: 'Signals', icon: Radio, href: '/signals',
    badge: s.status === 'investigating' ? 'Investigating' : s.status === 'monitoring' ? 'Monitoring' : 'New',
    badgeCls: s.status === 'investigating' ? 'badge-risk' : 'badge-watch',
  }))

  markets.forEach(m => results.push({
    id: m.id, label: m.name, sublabel: `${m.region} · Health: ${m.healthScore} · NPS: ${m.nps}`,
    category: 'Markets', icon: Globe, href: '/markets',
    badge: m.status === 'on-track' ? 'On Track' : m.status === 'at-risk' ? 'At Risk' : 'Watch',
    badgeCls: m.status === 'on-track' ? 'badge-track' : m.status === 'at-risk' ? 'badge-risk' : 'badge-watch',
  }))

  meetings.forEach(m => results.push({
    id: m.id, label: m.title, sublabel: `${m.date} ${m.time} · ${m.type}`,
    category: 'Meetings', icon: CalendarDays, href: '/meetings',
    badge: m.prepStatus === 'complete' ? 'Prep ready' : m.prepStatus === 'incomplete' ? 'Incomplete' : 'Not started',
    badgeCls: m.prepStatus === 'complete' ? 'badge-done' : 'badge-watch',
  }))

  strategicPriorities.forEach(sp => results.push({
    id: sp.id, label: sp.title, sublabel: `Owner: ${sp.owner} · ${sp.progress}% complete`,
    category: 'Strategic Priorities', icon: Target, href: '/priorities',
    badge: sp.status === 'on-track' ? 'On Track' : sp.status === 'at-risk' ? 'At Risk' : 'Watch',
    badgeCls: sp.status === 'on-track' ? 'badge-track' : sp.status === 'at-risk' ? 'badge-risk' : 'badge-watch',
  }))

  return results
}

const ALL_RESULTS = buildIndex()

const QUICK_COMMANDS = [
  { label: 'Go to Executive Overview', href: '/',                    icon: '⚡' },
  { label: 'Go to Decisions',          href: '/decisions',           icon: '✅' },
  { label: 'Go to Projects',           href: '/projects',            icon: '🚀' },
  { label: 'Go to Markets',            href: '/markets',             icon: '🌍' },
  { label: 'Go to Acquisition & Integration', href: '/acquisition-integration', icon: '🤝' },
  { label: 'Go to Sales & Payments',   href: '/sales-payments',      icon: '💳' },
  { label: 'Go to Risks',              href: '/risks',               icon: '⚠️' },
  { label: 'Go to Signals',            href: '/signals',             icon: '📡' },
  { label: 'Go to Actions',            href: '/actions',             icon: '📋' },
  { label: 'Go to Stakeholders',       href: '/stakeholders',        icon: '👥' },
]

interface Props { open: boolean; onClose: () => void }

export default function CommandPalette({ open, onClose }: Props) {
  const navigate = useNavigate()
  const [query,       setQuery]       = useState('')
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef  = useRef<HTMLDivElement>(null)

  const filteredResults = query.trim().length >= 1
    ? ALL_RESULTS.filter(r =>
        r.label.toLowerCase().includes(query.toLowerCase()) ||
        r.sublabel.toLowerCase().includes(query.toLowerCase()) ||
        r.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 12)
    : []

  const filteredCommands = query.trim().length === 0
    ? QUICK_COMMANDS.slice(0, 6)
    : QUICK_COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase())).slice(0, 4)

  const allItems = [
    ...filteredCommands.map(c => ({ ...c, isCommand: true })),
    ...filteredResults.map(r => ({ ...r, isCommand: false })),
  ]

  useEffect(() => {
    if (open) {
      setQuery('')
      setHighlighted(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => { setHighlighted(0) }, [query])

  const handleSelect = (href: string) => {
    navigate(href)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, allItems.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
    if (e.key === 'Enter' && allItems[highlighted]) handleSelect(allItems[highlighted].href)
    if (e.key === 'Escape') onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[500] flex items-start justify-center bg-black/40 backdrop-blur-sm pt-16 sm:pt-24 px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-in">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search decisions, projects, risks, signals…"
            className="flex-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
          <kbd className="shrink-0 text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto">
          {allItems.length === 0 && query.length > 0 && (
            <div className="py-10 text-center text-sm text-slate-400">
              No results for "<span className="font-medium text-slate-600">{query}</span>"
            </div>
          )}

          {filteredCommands.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {query ? 'Pages' : 'Quick navigation'}
              </p>
              {filteredCommands.map((cmd, i) => (
                <button
                  key={cmd.href}
                  onClick={() => handleSelect(cmd.href)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                    highlighted === i ? 'bg-slate-100' : 'hover:bg-slate-50'
                  )}
                  onMouseEnter={() => setHighlighted(i)}
                >
                  <span className="text-base w-5 text-center shrink-0">{cmd.icon}</span>
                  <span className="text-sm text-slate-700">{cmd.label}</span>
                  <ArrowRight size={12} className="ml-auto text-slate-300 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {filteredResults.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Results ({filteredResults.length})
              </p>
              {filteredResults.map((result, i) => {
                const idx = filteredCommands.length + i
                const Icon = result.icon
                return (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result.href)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors',
                      highlighted === idx ? 'bg-slate-100' : 'hover:bg-slate-50'
                    )}
                    onMouseEnter={() => setHighlighted(idx)}
                  >
                    <Icon size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate leading-snug">{result.label}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{result.sublabel}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                      {result.badge && <span className={cn('badge text-[10px]', result.badgeCls)}>{result.badge}</span>}
                      <span className="text-[10px] text-slate-300">{result.category}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
          {[['↑↓', 'navigate'], ['↵', 'open'], ['esc', 'close']].map(([key, label]) => (
            <span key={key} className="flex items-center gap-1 text-[10px] text-slate-400">
              <kbd className="font-mono bg-white border border-slate-200 px-1 py-0.5 rounded text-[9px]">{key}</kbd>
              {label}
            </span>
          ))}
          <span className="ml-auto text-[10px] text-slate-300">{ALL_RESULTS.length} records indexed</span>
        </div>
      </div>
    </div>
  )
}
