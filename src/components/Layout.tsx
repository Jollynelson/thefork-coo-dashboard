import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Sun, CheckSquare, CalendarDays, Target, FolderKanban,
  Globe, Users, AlertTriangle, LogOut, Menu, X,
  Search, Bell, Plus, ChevronDown, Handshake, CreditCard, ListTodo,
  Brain, BarChart3, Settings,
} from 'lucide-react'
import { cn } from '../lib/cn'
import QuickAddModal from './QuickAddModal'
import CommandPalette from './CommandPalette'
import { useToast, ToastContainer } from './Toast'

type ItemType = 'Decision' | 'Meeting' | 'Action' | 'Project' | 'Risk' | 'Stakeholder' | 'Opportunity' | 'Observation'

type NavLink_ = { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean; tag?: string }
type NavSection = { section: string }
type NavItem = NavLink_ | NavSection

const nav: NavItem[] = [
  { section: 'Daily' },
  { to: '/',         label: 'Executive Overview',      icon: LayoutDashboard, end: true },
  { to: '/my-day',   label: 'My Day',                  icon: Sun },
  { section: 'Operations' },
  { to: '/decisions', label: 'Decisions',              icon: CheckSquare },
  { to: '/actions',   label: 'Actions',                icon: ListTodo },
  { to: '/meetings',  label: 'Meetings',               icon: CalendarDays },
  { section: 'Strategy' },
  { to: '/priorities', label: 'Priorities & OKRs',    icon: Target },
  { to: '/projects',   label: 'Projects',             icon: FolderKanban },
  { section: 'Business' },
  { to: '/markets',       label: 'Markets',           icon: Globe },
  { to: '/sales-payments',label: 'Sales & Revenue',   icon: CreditCard },
  { to: '/people-budget', label: 'People & Budget',   icon: Users },
  { section: 'Intelligence' },
  { to: '/intelligence',  label: 'Risks & Signals',   icon: Brain },
  { section: 'Transition' },
  { to: '/acquisition-integration', label: 'Acquisition & Integration', icon: Handshake, tag: 'AmEx' },
  { section: 'System' },
  { to: '/reports',  label: 'Reports',                icon: BarChart3 },
  { to: '/settings', label: 'Settings',               icon: Settings },
]

const quickAddItems: ItemType[] = ['Decision', 'Meeting', 'Action', 'Project', 'Risk', 'Stakeholder', 'Opportunity', 'Observation']
const quickAddIcons: Record<ItemType, typeof CheckSquare> = {
  Decision: CheckSquare, Meeting: CalendarDays, Action: ListTodo, Project: FolderKanban,
  Risk: AlertTriangle, Stakeholder: Users, Opportunity: Brain, Observation: Brain,
}

const NOTIFS_INIT = [
  { icon: '🔴', text: 'ODP vendor decision deadline tomorrow (Aug 29)', time: '2h ago', unread: true },
  { icon: '🔶', text: 'Integration: systems sequencing decision needed by Sep 12', time: '3h ago', unread: true },
  { icon: '🟡', text: '"Restaurant Onboarding 2.0" moved to At Risk', time: '4h ago', unread: true },
  { icon: '🔴', text: '4 actions are overdue — review required', time: '6h ago', unread: true },
  { icon: '🟡', text: 'Italy payments success rate below 96% threshold', time: '1d ago', unread: false },
  { icon: '🔵', text: 'Integration steering committee prep incomplete', time: '1d ago', unread: false },
]

export default function Layout() {
  const navigate = useNavigate()
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [notifOpen,    setNotifOpen]    = useState(false)
  const [dismissed,    setDismissed]    = useState<number[]>([])
  const [addingType,   setAddingType]   = useState<ItemType | null>(null)
  const [paletteOpen,  setPaletteOpen]  = useState(false)
  const { toasts, toast, remove } = useToast()

  const quickAddRef = useRef<HTMLDivElement>(null)
  const notifRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (quickAddRef.current && !quickAddRef.current.contains(e.target as Node)) setQuickAddOpen(false)
      if (notifRef.current    && !notifRef.current.contains(e.target as Node))    setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setPaletteOpen(p => !p) }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const visibleNotifs = NOTIFS_INIT.filter((_, i) => !dismissed.includes(i))
  const unreadCount   = visibleNotifs.filter(n => n.unread).length

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <ToastContainer toasts={toasts} remove={remove} />
      <QuickAddModal open={addingType !== null} itemType={addingType}
        onClose={() => setAddingType(null)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-60 flex-col transition-transform duration-200 ease-in-out',
        'md:static md:translate-x-0 md:flex-shrink-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )} style={{ background: '#0C1A16' }}>

        <div className="flex h-16 shrink-0 items-center justify-between px-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex flex-col gap-0.5 min-w-0">
            <img src="/thefork-logo.png" alt="TheFork"
              className="h-6 w-auto object-contain select-none"
              style={{ filter: 'brightness(0) invert(1)', maxWidth: '130px' }}
              draggable={false} />
            <p className="text-[9.5px] font-medium" style={{ color: '#4A9B8C', letterSpacing: '0.06em' }}>
              COO Control Tower
            </p>
          </div>
          <button onClick={() => setMobileOpen(false)}
            className="flex md:hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg ml-2"
            style={{ color: '#4A9B8C' }}>
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-px">
          {nav.map((item, i) => {
            if ('section' in item) {
              return (
                <p key={i} className="mt-4 mb-1 px-3 text-[9px] font-semibold uppercase tracking-[0.14em] first:mt-2"
                  style={{ color: '#3D6860' }}>
                  {item.section}
                </p>
              )
            }
            const { to, label, icon: Icon, end, tag } = item
            return (
              <NavLink key={to} to={to} end={end}
                onClick={() => setMobileOpen(false)}
                className="relative flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-all duration-100 active:scale-[0.98]"
                style={({ isActive }) => ({
                  background: isActive
                    ? tag ? 'rgba(0,133,111,0.25)' : 'rgba(0,133,111,0.18)'
                    : 'transparent',
                  color: isActive ? '#FFFFFF' : tag ? '#34D399' : '#7EB8AD',
                })}>
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-r-full"
                      style={{ background: '#00856F' }} />}
                    <Icon size={15} className="shrink-0" />
                    <span className="truncate flex-1">{label}</span>
                    {tag && (
                      <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: 'rgba(0,133,111,0.2)', color: '#34D399' }}>
                        {tag}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="shrink-0 p-2 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
            style={{ background: 'rgba(0,133,111,0.12)' }}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: '#00856F' }}>AB</div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white truncate leading-none">Amanda Booker</p>
              <p className="text-[9.5px] mt-0.5 truncate leading-none" style={{ color: '#4A9B8C' }}>
                VP Global Sales, Ops & Payments
              </p>
            </div>
          </div>
          <button onClick={() => navigate('/settings')}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] transition-colors"
            style={{ color: '#4A9B8C' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
            onMouseLeave={e => (e.currentTarget.style.color = '#4A9B8C')}>
            <LogOut size={13} /> Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md z-30 px-3 sm:px-5">
          <div className="flex items-center gap-2.5 min-w-0">
            <button onClick={() => setMobileOpen(true)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors md:hidden">
              <Menu size={18} />
            </button>
            <img src="/thefork-logo.png" alt="TheFork"
              className="h-6 w-auto object-contain select-none md:hidden"
              style={{ maxWidth: '110px' }} draggable={false} />
            <button onClick={() => setPaletteOpen(true)}
              className="relative hidden md:flex items-center h-8 w-48 lg:w-64 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-400 hover:border-slate-300 hover:bg-white transition-colors text-left gap-2">
              <Search size={13} className="shrink-0" />
              <span>Search…</span>
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-mono">⌘K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <div ref={quickAddRef} className="relative">
              <button onClick={() => { setQuickAddOpen(p => !p); setNotifOpen(false) }}
                className="flex items-center gap-1 h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                <Plus size={13} />
                <span className="hidden sm:inline">Quick Add</span>
                <ChevronDown size={10} className="text-slate-400 hidden sm:block" />
              </button>
              {quickAddOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-slate-200 bg-white shadow-xl p-1.5 z-50 animate-slide-in">
                  {quickAddItems.map(type => {
                    const Icon = quickAddIcons[type]
                    return (
                      <button key={type} onClick={() => { setAddingType(type); setQuickAddOpen(false) }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                        <Icon size={12} className="text-slate-400" /> {type}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div ref={notifRef} className="relative">
              <button onClick={() => { setNotifOpen(p => !p); setQuickAddOpen(false) }}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
                <Bell size={15} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-80 max-w-[calc(100vw-1.5rem)] rounded-xl border border-slate-200 bg-white shadow-xl z-50 animate-slide-in overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-700">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={() => setDismissed(NOTIFS_INIT.map((_, i) => i))}
                        className="text-[10.5px] font-medium hover:underline" style={{ color: '#00856F' }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  {visibleNotifs.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">All caught up ✓</div>
                  ) : visibleNotifs.map((n, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                      <span className="text-sm mt-0.5 shrink-0">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700 leading-snug">{n.text}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                      </div>
                      <button onClick={() => setDismissed(p => [...p, NOTIFS_INIT.indexOf(n)])}
                        className="text-slate-300 hover:text-slate-500 shrink-0 mt-0.5"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => navigate('/settings')}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold transition-colors"
              style={{ background: '#00856F' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#006B5A')}
              onMouseLeave={e => (e.currentTarget.style.background = '#00856F')}>
              AB
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 pb-24">
          <Outlet />
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t py-1.5 px-4 text-center"
        style={{ background: '#0C1A16', borderColor: 'rgba(0,133,111,0.3)' }}>
        <p className="text-[10px] leading-snug" style={{ color: '#4A9B8C' }}>
          <span className="font-semibold" style={{ color: '#6EC9BC' }}>PROTOTYPE — ILLUSTRATIVE DATA ONLY</span>
          <span className="hidden sm:inline"> · No TheFork confidential or internal data is represented. References to the proposed American Express acquisition reflect publicly announced information only.</span>
        </p>
      </div>
    </div>
  )
}
