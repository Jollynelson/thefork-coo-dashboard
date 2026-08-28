import { useState } from 'react'
import { Clock, Plus, ExternalLink, CheckSquare, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../lib/cn'
import { stakeholders, decisions } from '../data/mockData'
import type { Health } from '../data/mockData'
import { useToast, ToastContainer } from '../components/Toast'
import QuickAddModal from '../components/QuickAddModal'

const healthConfig: Record<Health, { label: string; cls: string; avatar: string }> = {
  strong:            { label: 'Strong',          cls: 'badge-done',  avatar: 'bg-emerald-100 text-emerald-700' },
  healthy:           { label: 'Healthy',         cls: 'badge-track', avatar: 'bg-blue-100 text-blue-700' },
  watch:             { label: 'Watch',           cls: 'badge-watch', avatar: 'bg-amber-100 text-amber-700' },
  'needs-attention': { label: 'Needs Attention', cls: 'badge-risk',  avatar: 'bg-red-100 text-red-700' },
}

export default function Stakeholders() {
  const navigate = useNavigate()
  const [addOpen,  setAddOpen]  = useState(false)
  const [filter,   setFilter]   = useState('all')
  const { toasts, toast, remove } = useToast()

  const filtered = stakeholders.filter(s =>
    filter === 'all' ? true :
    filter === 'needs-attention' ? s.health === 'needs-attention' :
    filter === 'watch'           ? s.health === 'watch' :
    filter === 'integration'     ? (s.function === 'Integration' || s.function === 'Labor Relations') :
    true
  )

  const counts = {
    needsAttn:   stakeholders.filter(s => s.health === 'needs-attention').length,
    watch:       stakeholders.filter(s => s.health === 'watch').length,
    healthy:     stakeholders.filter(s => s.health === 'healthy' || s.health === 'strong').length,
    integration: stakeholders.filter(s => s.function === 'Integration' || s.function === 'Labor Relations').length,
  }

  return (
    <div className="space-y-5">
      <ToastContainer toasts={toasts} remove={remove} />
      <QuickAddModal open={addOpen} itemType="Stakeholder" onClose={() => { setAddOpen(false); toast('Stakeholder added.') }} />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Stakeholder Center</h1>
          <p className="page-subtitle">Relationship health, interaction tracking, and engagement management.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary shrink-0">
          <Plus size={13} /> Add Stakeholder
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Needs Attention', value: counts.needsAttn,   cls: 'text-red-600' },
          { label: 'Watch',           value: counts.watch,       cls: 'text-amber-600' },
          { label: 'Healthy/Strong',  value: counts.healthy,     cls: 'text-emerald-600' },
          { label: 'Integration',     value: counts.integration, cls: 'text-orange-600' },
        ].map(m => (
          <div key={m.label} className="card p-4">
            <p className={cn('text-2xl font-bold', m.cls)}>{m.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { key: 'all',              label: `All (${stakeholders.length})` },
          { key: 'needs-attention',  label: `Needs Attention (${counts.needsAttn})` },
          { key: 'watch',            label: `Watch (${counts.watch})` },
          { key: 'integration',      label: '🤝 Integration' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={cn('tab', filter === f.key && 'active')}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(s => {
          const hcfg = healthConfig[s.health]
          const linkedDec = s.decisionPending ? decisions.find(d => d.id === s.decisionPending) : null

          return (
            <div key={s.id} className="card p-4 sm:p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold', hcfg.avatar)}>
                    {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 leading-none">{s.name}</p>
                    <p className="text-[10.5px] text-slate-400 mt-0.5 truncate">{s.role}</p>
                  </div>
                </div>
                <span className={cn('badge shrink-0', hcfg.cls)}>{hcfg.label}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="badge badge-parked">{s.function}</span>
                {s.market !== 'Global' && <span className="badge badge-parked">{s.market}</span>}
                <span className="badge badge-parked">Influence: {s.influence}</span>
              </div>

              <div className="mb-3">
                <p className="text-[9.5px] text-slate-400 uppercase tracking-wide font-semibold mb-1">Current Priority</p>
                <p className="text-xs text-slate-600 leading-snug">{s.currentPriority}</p>
              </div>

              {s.openIssue && (
                <div className="p-2.5 bg-red-50 rounded-lg border border-red-100 mb-3">
                  <p className="text-[11px] text-red-700 leading-snug">{s.openIssue}</p>
                </div>
              )}

              {/* Linked decision */}
              {linkedDec && (
                <button onClick={() => navigate('/decisions')}
                  className="w-full flex items-center gap-2 p-2.5 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors text-left mb-3">
                  <CheckSquare size={11} className="text-orange-400 shrink-0" />
                  <p className="text-[10.5px] text-orange-700 font-medium flex-1 truncate">{linkedDec.title.slice(0, 42)}…</p>
                  <ExternalLink size={10} className="text-orange-300 shrink-0" />
                </button>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[10.5px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock size={9} />Last: {s.lastInteraction.slice(5).replace('-','/')}
                </span>
                <span>Next: {s.nextInteraction.slice(5).replace('-','/')}</span>
                <button
                  onClick={() => toast(`Interaction note added for ${s.name}.`)}
                  className="flex items-center gap-0.5 hover:text-slate-600 transition-colors"
                  title="Log interaction"
                >
                  <MessageCircle size={12} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
