import { useState } from 'react'
import { User, Shield, Bell, Database, Check } from 'lucide-react'
import { cn } from '../lib/cn'
import { useToast, ToastContainer } from '../components/Toast'

const roles = [
  { id: 'coo',   label: 'COO',            desc: 'Full executive view — all modules and data' },
  { id: 'cos',   label: 'Chief of Staff', desc: 'Full operational administration' },
  { id: 'lt',    label: 'Leadership Team', desc: 'Relevant priorities, projects, decisions and actions' },
  { id: 'cm',    label: 'Country Manager', desc: 'Market-specific information only' },
  { id: 'pl',    label: 'Project Lead',   desc: 'Assigned projects only' },
]

const notifs = [
  { id: 'dec',        label: 'Decision deadline approaching',     default: true },
  { id: 'proj',       label: 'Project health change',             default: true },
  { id: 'budget',     label: 'Budget variance threshold crossed', default: true },
  { id: 'action',     label: 'Action overdue',                    default: true },
  { id: 'market',     label: 'Market escalation',                 default: true },
  { id: 'integration',label: 'Integration milestone at risk',     default: true },
  { id: 'kpi',        label: 'KPI threshold crossed',             default: false },
  { id: 'stake',      label: 'Stakeholder interaction overdue',   default: false },
]

export default function Settings() {
  const [role,    setRole]    = useState('coo')
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    () => Object.fromEntries(notifs.map(n => [n.id, n.default]))
  )
  const [profile, setProfile] = useState({
    name: 'Amanda Booker',
    roleTitle: 'VP, Global Sales, Operations & Payments',
    org: 'TheFork (Illustrative Prototype)',
    email: 'amanda.booker@demo.thefork.com',
  })
  const { toasts, toast, remove } = useToast()

  return (
    <div className="space-y-5">
      <ToastContainer toasts={toasts} remove={remove} />
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Prototype configuration and user preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={15} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Access Role</h3>
          </div>
          <div className="space-y-2">
            {roles.map(r => (
              <button key={r.id} onClick={() => setRole(r.id)}
                className={cn('w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all',
                  role === r.id ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50')}>
                <div className={cn('flex h-5 w-5 items-center justify-center rounded-full border-2 shrink-0',
                  role === r.id ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300')}>
                  {role === r.id && <Check size={10} className="text-white" />}
                </div>
                <div>
                  <p className={cn('text-xs font-semibold', role === r.id ? 'text-indigo-800' : 'text-slate-700')}>{r.label}</p>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">{r.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={15} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Profile</h3>
          </div>
          <div className="space-y-3">
            {(Object.keys(profile) as Array<keyof typeof profile>).map(key => (
              <div key={key}>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  {key === 'roleTitle' ? 'Role Title' : key === 'org' ? 'Organisation' : key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <input className="input mt-1" value={profile[key]}
                  onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={15} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
          </div>
          <div className="space-y-3">
            {notifs.map(n => (
              <div key={n.id} className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-700">{n.label}</span>
                <button onClick={() => setEnabled(p => ({ ...p, [n.id]: !p[n.id] }))}
                  className={cn('relative w-10 h-5 rounded-full transition-colors shrink-0',
                    enabled[n.id] ? 'bg-indigo-500' : 'bg-slate-200')}>
                  <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                    enabled[n.id] ? 'translate-x-5' : 'translate-x-0.5')} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Database size={15} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Prototype Information</h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 mb-4">
            <p className="text-xs font-bold text-amber-700 mb-1">PROTOTYPE — ILLUSTRATIVE DATA ONLY</p>
            <p className="text-[11px] text-amber-600 leading-relaxed">
              All data is entirely fictional. References to the American Express acquisition reflect publicly announced information only.
              No TheFork confidential or internal data is represented.
            </p>
          </div>
          <div className="space-y-2 text-xs text-slate-600 flex-1">
            {[
              ['Version',    '2.0 — Prototype'],
              ['Context',    'Personalised for Amanda Booker, COO'],
              ['Deal ref',   'AmEx/TheFork (public info only)'],
              ['Markets',    '6 fictional market clusters'],
              ['Built with', 'React + Vite + Tailwind + Recharts'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-slate-50 pb-2 last:border-0">
                <span className="text-slate-400">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => toast('Settings saved successfully.')} className="btn-primary px-6 py-2.5 text-sm">
          <Check size={14} /> Save Settings
        </button>
      </div>
    </div>
  )
}
