import { useState } from 'react'
import { Clock, CheckCircle2, RotateCcw, Plus } from 'lucide-react'
import { cn } from '../lib/cn'
import { actions as initialActions, decisions, projects, meetings, PERSON_ID } from '../data/mockData'
import { useToast, ToastContainer } from '../components/Toast'
import QuickAddModal from '../components/QuickAddModal'
import RecordLink from '../components/RecordLink'

const priorityConfig: Record<string, { label: string; cls: string }> = {
  critical: { label: 'Critical', cls: 'badge-crit' },
  high:     { label: 'High',     cls: 'badge-risk' },
  medium:   { label: 'Medium',   cls: 'badge-watch' },
  low:      { label: 'Low',      cls: 'badge-parked' },
}

export default function Actions() {
  const [filter,  setFilter]  = useState('all')
  const [done,    setDone]    = useState<Set<string>>(new Set())
  const [statuses, setStatuses] = useState<Record<string, string>>(
    () => Object.fromEntries(initialActions.map(a => [a.id, a.status]))
  )
  const [addOpen, setAddOpen] = useState(false)
  const { toasts, toast, remove } = useToast()

  const markComplete = (id: string, title: string) => {
    setDone(p => new Set([...p, id]))
    toast(`Action complete: "${title.slice(0, 45)}…"`)
  }
  const reopen = (id: string) => setDone(p => { const n = new Set(p); n.delete(id); return n })

  const filtered = initialActions.filter(a => {
    const isDone   = done.has(a.id)
    const status   = isDone ? 'done' : statuses[a.id]
    if (filter === 'done')    return isDone
    if (filter === 'all')     return !isDone
    if (filter === 'overdue') return !isDone && status === 'overdue'
    if (filter === 'open')    return !isDone && status === 'open'
    if (filter === 'coo')     return !isDone && a.owner === 'COO'
    return true
  })

  const overdue   = initialActions.filter(a => !done.has(a.id) && statuses[a.id] === 'overdue').length
  const open      = initialActions.filter(a => !done.has(a.id) && statuses[a.id] === 'open').length
  const cooActs   = initialActions.filter(a => !done.has(a.id) && a.owner === 'COO').length
  const completed = done.size

  return (
    <div className="space-y-5">
      <ToastContainer toasts={toasts} remove={remove} />
      <QuickAddModal open={addOpen} itemType="Action" onClose={() => { setAddOpen(false); toast('Action added.') }} />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Action Center</h1>
          <p className="page-subtitle">All committed actions — linked to their source meeting, decision, or project.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary shrink-0"><Plus size={13} /> Add Action</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Overdue',     value: overdue,    cls: 'text-red-600' },
          { label: 'Open',        value: open,       cls: 'text-amber-600' },
          { label: 'COO Actions', value: cooActs,    cls: 'text-indigo-600' },
          { label: 'Completed',   value: completed,  cls: 'text-emerald-600' },
        ].map(m => (
          <div key={m.label} className="card p-4">
            <p className={cn('text-2xl font-bold', m.cls)}>{m.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[
          { key: 'all',     label: 'Open' },
          { key: 'overdue', label: `Overdue (${overdue})` },
          { key: 'open',    label: `Upcoming (${open})` },
          { key: 'coo',     label: `COO Actions (${cooActs})` },
          { key: 'done',    label: `Completed (${completed})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={cn('tab', filter === f.key && 'active')}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-10 text-center">
            <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">
              {filter === 'done' ? 'No completed actions yet.' : 'All clear — nothing here.'}
            </p>
            <button onClick={() => setAddOpen(true)} className="btn-primary mt-4 mx-auto"><Plus size={13} /> Add Action</button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(act => {
              const isDone     = done.has(act.id)
              const status     = isDone ? 'done' : statuses[act.id]
              const pcfg       = priorityConfig[act.priority]
              const isOverdue  = status === 'overdue'
              const linkedDec  = act.relatedDecision ? decisions.find(d => d.id === act.relatedDecision) : null
              const linkedProj = act.relatedProject  ? projects.find(p => p.id === act.relatedProject) : null
              const linkedMtg  = (act as any).linkedMeetingId ? meetings.find(m => m.id === (act as any).linkedMeetingId) : null

              return (
                <div key={act.id} id={`record-${act.id}`}
                  className={cn('px-4 py-3.5 hover:bg-slate-50/60 transition-colors',
                    isOverdue && !isDone && 'bg-red-50/30',
                    isDone && 'opacity-50')}>
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => isDone ? reopen(act.id) : markComplete(act.id, act.title)}
                      className={cn('mt-0.5 shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all',
                        isDone    ? 'bg-emerald-500 border-emerald-500 text-white' :
                        isOverdue ? 'border-red-300 hover:border-red-400' :
                                    'border-slate-300 hover:border-slate-400')}>
                      {isDone && <CheckCircle2 size={13} />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        {pcfg && <span className={cn('badge', pcfg.cls)}>{pcfg.label}</span>}
                        {isOverdue && !isDone && <span className="badge badge-risk">Overdue</span>}
                      </div>

                      <p className={cn('text-sm font-medium text-slate-800 leading-snug',
                        isDone && 'line-through text-slate-400')}>
                        {act.title}
                      </p>

                      {/* Links row */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <RecordLink
                          type="person"
                          id={(act as any).ownerPersonId ?? PERSON_ID[act.owner]}
                          label={act.owner}
                        />
                        <span className={cn('text-[10.5px] flex items-center gap-1',
                          isOverdue && !isDone ? 'text-red-500 font-medium' : 'text-slate-400')}>
                          <Clock size={9} />{act.dueDate.slice(5).replace('-','/')}
                        </span>
                        {linkedMtg && (
                          <RecordLink type="meeting" id={linkedMtg.id} label={linkedMtg.title} truncate={28} />
                        )}
                        {linkedDec && (
                          <RecordLink type="decision" id={linkedDec.id} label={linkedDec.title} truncate={28} />
                        )}
                        {linkedProj && (
                          <RecordLink type="project" id={linkedProj.id} label={linkedProj.name} truncate={24} />
                        )}
                      </div>

                      {/* Source */}
                      <p className="text-[10px] text-slate-400 mt-1 truncate">Source: {act.source}</p>
                    </div>

                    {isDone && (
                      <button onClick={() => reopen(act.id)}
                        className="shrink-0 text-slate-300 hover:text-slate-500 transition-colors mt-1"
                        title="Reopen">
                        <RotateCcw size={13} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
