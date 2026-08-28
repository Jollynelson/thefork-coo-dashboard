import { useState } from 'react'
import {
  CalendarDays, AlertCircle, ChevronDown, ChevronUp,
  CheckCircle2, FileText, Plus, ListTodo, MapPin,
} from 'lucide-react'
import { cn } from '../lib/cn'
import { meetings as allMeetings, actions, decisions, PERSON_ID } from '../data/mockData'
import { useToast, ToastContainer } from '../components/Toast'
import QuickAddModal from '../components/QuickAddModal'
import RecordLink from '../components/RecordLink'
import { useAutoExpand } from '../hooks/useAutoExpand'

type PrepStatus = 'complete' | 'incomplete' | 'not-started'
type FilterKey  = 'all' | 'today' | 'leadership' | 'market' | 'integration'

const getMeetingActions = (meetingId: string) =>
  actions.filter(a => (a as any).linkedMeetingId === meetingId)

const getMeetingDecisions = (decIds: string[]) =>
  decisions.filter(d => decIds.includes(d.id))

const typeColors: Record<string, string> = {
  ELT: 'badge-crit', Market: 'badge-new', Finance: 'badge-watch',
  'Board Prep': 'badge-risk', 'Strategic Project': 'badge-track',
  'Integration / steering committee': 'badge-open',
}
const prepColors: Record<PrepStatus, string> = {
  complete: 'badge-done', incomplete: 'badge-watch', 'not-started': 'badge-parked',
}
const prepLabels: Record<PrepStatus, string> = {
  complete: '✓ Prep ready', incomplete: '⚠ Incomplete', 'not-started': 'Not started',
}

// Match participant display names to person IDs
function participantId(name: string): string | undefined {
  const clean = name.replace(/\s*\(.*\)/, '').trim()
  return PERSON_ID[clean] ?? PERSON_ID[name]
}

export default function Meetings() {
  const { expanded, setExpanded } = useAutoExpand()
  const [filter,       setFilter]       = useState<FilterKey>('all')
  const [prepStatuses, setPrepStatuses] = useState<Record<string, PrepStatus>>(
    () => Object.fromEntries(allMeetings.map(m => [m.id, m.prepStatus as PrepStatus]))
  )
  const [addOpen,    setAddOpen]    = useState(false)
  const [addActOpen, setAddActOpen] = useState(false)
  const { toasts, toast, remove } = useToast()

  const markPrepComplete = (id: string, title: string) => {
    setPrepStatuses(p => ({ ...p, [id]: 'complete' }))
    toast(`Meeting prep complete: "${title.slice(0, 40)}…"`)
  }

  const filterFns: Record<FilterKey, (m: typeof allMeetings[0]) => boolean> = {
    all:         () => true,
    today:       m => m.date === '2026-08-26',
    leadership:  m => m.type === 'ELT' || m.type === 'Board Prep',
    market:      m => m.type === 'Market',
    integration: m => m.type.toLowerCase().includes('integration'),
  }

  const filtered = allMeetings.filter(filterFns[filter])

  const stats = {
    total:      allMeetings.length,
    ready:      Object.values(prepStatuses).filter(s => s === 'complete').length,
    incomplete: Object.values(prepStatuses).filter(s => s === 'incomplete').length,
    decisions:  allMeetings.reduce((a, m) => a + m.decisionsExpected, 0),
  }

  return (
    <div className="space-y-5">
      <ToastContainer toasts={toasts} remove={remove} />
      <QuickAddModal open={addOpen}    itemType="Meeting" onClose={() => { setAddOpen(false);    toast('Meeting added.') }} />
      <QuickAddModal open={addActOpen} itemType="Action"  onClose={() => { setAddActOpen(false); toast('Action recorded from meeting.') }} />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Meetings Center</h1>
          <p className="page-subtitle">Preparation, linked decisions, outcome actions, and participant tracking.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary shrink-0"><Plus size={13} /> Add Meeting</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Meetings',     value: stats.total,      cls: 'text-slate-800' },
          { label: 'Prep Complete',      value: stats.ready,      cls: 'text-emerald-600' },
          { label: 'Prep Incomplete',    value: stats.incomplete, cls: 'text-amber-600' },
          { label: 'Decisions Expected', value: stats.decisions,  cls: 'text-orange-600' },
        ].map(m => (
          <div key={m.label} className="card p-4">
            <p className={cn('text-2xl font-bold', m.cls)}>{m.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[
          { key: 'all' as FilterKey,        label: 'All' },
          { key: 'today' as FilterKey,       label: 'Today' },
          { key: 'leadership' as FilterKey,  label: 'Leadership' },
          { key: 'market' as FilterKey,      label: 'Market' },
          { key: 'integration' as FilterKey, label: '🤝 Integration' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={cn('tab', filter === f.key && 'active')}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(mtg => {
          const prepStatus      = prepStatuses[mtg.id]
          const isOpen          = expanded === mtg.id
          const isComplete      = prepStatus === 'complete'
          const linkedActions   = getMeetingActions(mtg.id)
          const linkedDecisions = getMeetingDecisions(mtg.openDecisions)
          const typeLabel       = mtg.type.includes('Integration') ? '🤝 Integration Steering' : mtg.type

          return (
            <div key={mtg.id} id={`record-${mtg.id}`} className={cn('card overflow-hidden', isComplete && 'opacity-80')}>
              <button
                onClick={() => setExpanded(isOpen ? null : mtg.id)}
                className="w-full flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4 text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex flex-col items-center justify-center rounded-lg bg-slate-100 px-2.5 py-2 shrink-0 min-w-[52px]">
                  <p className="text-xs font-bold text-slate-700">{mtg.time}</p>
                  <p className="text-[9px] text-slate-400">{mtg.duration}m</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className={cn('badge', typeColors[mtg.type] ?? 'badge-parked')}>{typeLabel}</span>
                    <span className={cn('badge', prepColors[prepStatus])}>{prepLabels[prepStatus]}</span>
                    {mtg.decisionsExpected > 0 && (
                      <span className="badge badge-open">{mtg.decisionsExpected} decision{mtg.decisionsExpected > 1 ? 's' : ''}</span>
                    )}
                    {linkedActions.length > 0 && (
                      <span className="badge badge-parked">{linkedActions.length} action{linkedActions.length > 1 ? 's' : ''}</span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-snug">{mtg.title}</p>
                  {!isOpen && (
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin size={10} />{mtg.location}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isOpen ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                  {/* Location */}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin size={12} className="text-slate-400 shrink-0" />
                    <span>{mtg.location}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Objective</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{mtg.objective}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                        Participants ({mtg.participants.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {mtg.participants.map((p, i) => {
                          const pid = (mtg as any).participantIds?.[i] ?? participantId(p)
                          return pid
                            ? <RecordLink key={i} type="person" id={pid} label={p.replace(/\s*\(.*\)/, '').trim()} />
                            : <span key={i} className="badge badge-parked text-[10px]">{p}</span>
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Agenda */}
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Agenda</p>
                    <div className="space-y-1.5">
                      {mtg.agenda.map((item, i) => (
                        <div key={i} className="flex gap-2 text-sm text-slate-600">
                          <span className="text-slate-300 shrink-0 font-medium">{i + 1}.</span>
                          <span className="leading-snug">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Linked decisions */}
                  {linkedDecisions.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
                        Decisions on Agenda ({linkedDecisions.length})
                      </p>
                      <div className="space-y-2">
                        {linkedDecisions.map(dec => (
                          <div key={dec.id} className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
                            <div className="flex-1 min-w-0">
                              <RecordLink type="decision" id={dec.id} label={dec.title} truncate={60} />
                              <p className="text-[10px] text-orange-600 mt-1">
                                Due {dec.deadline.slice(5).replace('-','/')} · Owner: {dec.owner} · {dec.daysOpen}d open
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Previous commitments */}
                  {mtg.previousCommitments.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Previous Commitments</p>
                      {mtg.previousCommitments.map((c, i) => (
                        <div key={i} className="flex gap-2 text-sm text-slate-600 mb-1.5">
                          <AlertCircle size={12} className="text-amber-400 mt-0.5 shrink-0" />
                          <span className="leading-snug">{c}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Linked actions */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                        Actions from this Meeting {linkedActions.length > 0 && `(${linkedActions.length})`}
                      </p>
                      <button onClick={() => setAddActOpen(true)}
                        className="flex items-center gap-1 text-[10.5px] font-medium hover:underline"
                        style={{ color: '#00856F' }}>
                        <Plus size={10} /> Add Action
                      </button>
                    </div>
                    {linkedActions.length > 0 ? (
                      <div className="space-y-1.5">
                        {linkedActions.map(act => (
                          <div key={act.id} className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                            <ListTodo size={12} className="text-slate-400 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-700 leading-snug">{act.title}</p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <RecordLink type="person" id={(act as any).ownerPersonId ?? PERSON_ID[act.owner]} label={act.owner} />
                                <span className={cn('text-[10px]', act.status === 'overdue' && 'text-red-500 font-medium')}>
                                  {act.dueDate.slice(5).replace('-','/')}
                                  {act.status === 'overdue' && ' · OVERDUE'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <p className="text-xs text-slate-400">No actions recorded yet.</p>
                        <button onClick={() => setAddActOpen(true)}
                          className="ml-auto text-[10.5px] font-medium hover:underline shrink-0"
                          style={{ color: '#00856F' }}>
                          Record action →
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Footer actions */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {!isComplete ? (
                      <>
                        <button onClick={() => markPrepComplete(mtg.id, mtg.title)} className="btn-success">
                          <CheckCircle2 size={13} /> Mark Prep Complete
                        </button>
                        <button className="btn-secondary"><FileText size={13} /> View Prep Brief</button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="badge badge-done">✓ Prep complete</span>
                        <button
                          onClick={() => { setPrepStatuses(p => ({ ...p, [mtg.id]: 'incomplete' })); toast('Prep marked incomplete.', 'info') }}
                          className="text-xs text-slate-400 hover:text-slate-600 underline">Undo</button>
                      </div>
                    )}
                    <button onClick={() => setAddActOpen(true)} className="btn-secondary">
                      <Plus size={13} /> Record Outcome Action
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
