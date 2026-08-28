import { useNavigate } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { cn } from '../lib/cn'

export type LinkType = 'person' | 'project' | 'decision' | 'market' | 'risk' | 'meeting' | 'action' | 'signal' | 'okr' | 'integration'

const linkConfig: Record<LinkType, { path: string; cls: string }> = {
  person:      { path: '/people-budget',            cls: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  project:     { path: '/projects',                 cls: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  decision:    { path: '/decisions',                cls: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
  market:      { path: '/markets',                  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
  risk:        { path: '/intelligence',             cls: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
  meeting:     { path: '/meetings',                 cls: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' },
  action:      { path: '/actions',                  cls: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' },
  signal:      { path: '/intelligence',             cls: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100' },
  okr:         { path: '/priorities',               cls: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100' },
  integration: { path: '/acquisition-integration',  cls: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
}

interface Props {
  type: LinkType
  id?: string
  label: string
  truncate?: number
  className?: string
}

export default function RecordLink({ type, id, label, truncate, className }: Props) {
  const navigate = useNavigate()
  const cfg = linkConfig[type]
  const display = truncate && label.length > truncate ? label.slice(0, truncate) + '…' : label

  return (
    <button
      onClick={e => { e.stopPropagation(); navigate(cfg.path, { state: { openId: id } }) }}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        'active:scale-95 transition-all cursor-pointer whitespace-nowrap select-none',
        cfg.cls, className
      )}
    >
      {display}
      <ExternalLink size={9} className="shrink-0 opacity-50" />
    </button>
  )
}
