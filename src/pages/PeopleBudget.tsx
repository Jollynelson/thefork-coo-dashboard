import { useState } from 'react'
import { TrendingDown, TrendingUp, AlertTriangle, Plus, Users } from 'lucide-react'
import { cn } from '../lib/cn'
import { budgetData, revenueData, attritionData, strategicPriorities } from '../data/mockData'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import { useToast, ToastContainer } from '../components/Toast'
import QuickAddModal from '../components/QuickAddModal'

const fmt = (v: number) => v >= 1_000_000 ? `€${(v / 1_000_000).toFixed(1)}M` : `€${(v / 1_000).toFixed(0)}k`

// Budget → priority alignment (illustrative mapping)
const priorityBudgetMap = [
  { priority: 'Scale restaurant network',         allocation: '€6.2M',  pct: 14, category: 'Operations + Sales' },
  { priority: 'Dynamic pricing engine',           allocation: '€0.9M',  pct: 2,  category: 'Technology' },
  { priority: 'Loyalty revamp',                   allocation: '€0.5M',  pct: 1,  category: 'Marketing' },
  { priority: 'Operations data platform',         allocation: '€1.2M',  pct: 3,  category: 'Technology' },
  { priority: 'Payments improvement',             allocation: '€0.8M',  pct: 2,  category: 'Technology' },
  { priority: 'Integration programme',            allocation: '€0.9M',  pct: 2,  category: 'Integration' },
  { priority: 'Core business operations (BAU)',   allocation: '€33.7M', pct: 76, category: 'All categories' },
]

export default function PeopleBudget() {
  const [tab, setTab] = useState<'overview' | 'revenue' | 'budget' | 'people'>('overview')
  const [addOpen, setAddOpen] = useState(false)
  const { toasts, toast, remove } = useToast()

  const revenueStatus = revenueData.commissionVariance < 0 ? 'watch' : 'on-track'

  return (
    <div className="space-y-5">
      <ToastContainer toasts={toasts} remove={remove} />
      <QuickAddModal open={addOpen} itemType="Action"
        onClose={() => { setAddOpen(false); toast('Action added.') }} />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="page-title">People & Budget</h1>
          <p className="page-subtitle">Revenue performance, budget management, and headcount tracking. All figures illustrative.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="btn-primary shrink-0">
          <Plus size={13} /> Add Action
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 bg-slate-100 rounded-xl p-1 w-fit">
        {(['overview', 'revenue', 'budget', 'people'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize',
              tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
            {t === 'people' ? 'People & HC' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Commission QTD',  value: `€${(revenueData.commissionQTD / 1e6).toFixed(1)}M`, sub: `${revenueData.commissionVariance}% vs target`, cls: 'text-amber-600' },
              { label: 'YoY Growth',      value: `${revenueData.yoyGrowth}%`,  sub: `target ${revenueData.yoyTarget}%`, cls: revenueData.yoyGrowth >= revenueData.yoyTarget ? 'text-emerald-600' : 'text-amber-600' },
              { label: 'FY Budget Forecast', value: fmt(budgetData.fyForecast), sub: `+€${(budgetData.variance/1e6).toFixed(1)}M over plan`, cls: 'text-amber-600' },
              { label: 'Headcount Fill', value: `${Math.round(budgetData.headcount.current/budgetData.headcount.planned*100)}%`, sub: `${budgetData.headcount.open} open roles`, cls: 'text-slate-700' },
            ].map(m => (
              <div key={m.label} className="card p-4">
                <p className={cn('text-xl font-bold', m.cls)}>{m.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
                <p className="text-[10px] text-slate-400">{m.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Revenue health */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-800">Revenue vs. Plan</h3>
                <span className={cn('badge', revenueStatus === 'on-track' ? 'badge-track' : 'badge-watch')}>
                  {revenueStatus === 'on-track' ? 'On Track' : 'Watch'}
                </span>
              </div>
              <div className="space-y-2">
                {revenueData.byMarket.map(m => (
                  <div key={m.market}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium text-slate-700 w-10">{m.market}</span>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-slate-500">{m.revenue} / {m.target}</span>
                        <span className={cn('font-semibold', m.variance.startsWith('-') ? 'text-red-500' : 'text-emerald-600')}>
                          {m.variance}
                        </span>
                        <span className={cn('badge text-[9.5px]',
                          m.status === 'on-track' ? 'badge-track' : m.status === 'at-risk' ? 'badge-risk' : 'badge-watch')}>
                          {m.status === 'on-track' ? 'On Track' : m.status === 'at-risk' ? 'At Risk' : 'Watch'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* People health */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-800">People Health</h3>
                <span className="badge badge-risk">Attrition Watch</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Attrition YTD', value: `${attritionData.voluntaryAttritionYTD}%`, sub: `target ${attritionData.attritionTarget}%`, bad: true },
                  { label: 'Pulse Sentiment', value: `${attritionData.pulseSentiment}`, sub: `baseline ${attritionData.pulseSentimentBaseline} pre-announcement`, bad: true },
                  { label: 'Critical Roles >60d', value: attritionData.criticalRolesOpenOver60Days, sub: 'vacant positions', bad: true },
                  { label: 'At Offer Stage', value: attritionData.offerStage, sub: 'candidates', bad: false },
                ].map(m => (
                  <div key={m.label} className={cn('rounded-xl p-3', m.bad ? 'bg-red-50 border border-red-100' : 'bg-emerald-50 border border-emerald-100')}>
                    <p className={cn('text-lg font-bold', m.bad ? 'text-red-700' : 'text-emerald-700')}>{m.value}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{m.label}</p>
                    <p className="text-[9.5px] text-slate-400">{m.sub}</p>
                  </div>
                ))}
              </div>
              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide mb-0.5">Transition Context</p>
                <p className="text-xs text-amber-700">Pulse sentiment down 8pts since acquisition announcement (Jun 2026). 3 senior leaders at elevated attrition risk. Retention packages in design.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── REVENUE TAB ── */}
      {tab === 'revenue' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Commission QTD',   value: `€${(revenueData.commissionQTD / 1e6).toFixed(1)}M`,    sub: `vs €${(revenueData.commissionTarget / 1e6).toFixed(1)}M target`, cls: 'text-amber-600' },
              { label: 'QTD Variance',     value: `${revenueData.commissionVariance}%`,                   sub: '4 of 6 markets below target', cls: 'text-amber-600' },
              { label: 'YoY Revenue Growth', value: `+${revenueData.yoyGrowth}%`,                        sub: `target ${revenueData.yoyTarget}%`, cls: revenueData.yoyGrowth >= revenueData.yoyTarget ? 'text-emerald-600' : 'text-amber-600' },
              { label: 'Global Take Rate', value: `${revenueData.takeRate}%`,                             sub: revenueData.takeRateTrend, cls: 'text-slate-700' },
            ].map(m => (
              <div key={m.label} className="card p-4">
                <p className={cn('text-xl font-bold', m.cls)}>{m.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
                <p className="text-[10px] text-slate-400">{m.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="card p-5">
              <p className="section-header">Monthly Revenue vs. Target</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={revenueData.monthlyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00856F" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#00856F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickLine={false} axisLine={false}
                    tickFormatter={v => `€${(v/1e6).toFixed(1)}M`} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                    formatter={(v: number) => [fmt(v)]} />
                  <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="target" name="Target" stroke="#CBD5E1" fill="none" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                  <Area type="monotone" dataKey="actual" name="Actual" stroke="#00856F" fill="url(#gRev)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <p className="section-header">Revenue by Market</p>
              <div className="tbl-wrap">
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr>
                      {['Market', 'Revenue QTD', 'Target', 'Variance', 'Status'].map(h => (
                        <th key={h} className="tbl-head first:pl-4 last:pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.byMarket.map(m => (
                      <tr key={m.market} className="tbl-row">
                        <td className="tbl-cell pl-4 font-semibold">{m.market}</td>
                        <td className="tbl-cell font-medium text-slate-800">{m.revenue}</td>
                        <td className="tbl-cell text-slate-500">{m.target}</td>
                        <td className="tbl-cell">
                          <span className={cn('font-semibold text-sm',
                            m.variance.startsWith('-') ? 'text-red-600' : 'text-emerald-600')}>
                            {m.variance}
                          </span>
                        </td>
                        <td className="tbl-cell pr-4">
                          <span className={cn('badge',
                            m.status === 'on-track' ? 'badge-track' : m.status === 'at-risk' ? 'badge-risk' : 'badge-watch')}>
                            {m.status === 'on-track' ? 'On Track' : m.status === 'at-risk' ? 'At Risk' : 'Watch'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BUDGET TAB ── */}
      {tab === 'budget' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Annual Budget', value: fmt(budgetData.annual),     sub: 'FY2026 plan',         cls: 'text-slate-800' },
              { label: 'YTD Actual',    value: fmt(budgetData.ytdActual),  sub: `${Math.round(budgetData.ytdActual/budgetData.annual*100)}% consumed`, cls: 'text-slate-800' },
              { label: 'FY Forecast',   value: fmt(budgetData.fyForecast), sub: `+${budgetData.variancePct}% vs. plan`, cls: 'text-amber-600' },
              { label: 'Variance',      value: `+${fmt(budgetData.variance)}`, sub: 'T&E primary driver', cls: 'text-red-600' },
            ].map(m => (
              <div key={m.label} className="card p-4">
                <p className={cn('text-xl font-bold', m.cls)}>{m.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
                <p className="text-[10px] text-slate-400">{m.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="card p-5">
              <p className="section-header">Spend by Category</p>
              <div className="space-y-3.5">
                {budgetData.categories.map(cat => {
                  const pct = Math.round((cat.actual / cat.annual) * 100)
                  const isOver = cat.variance > 0
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-700">{cat.name}</span>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-slate-500">{fmt(cat.actual)} / {fmt(cat.annual)}</span>
                          <span className={cn('font-semibold', isOver ? 'text-red-500' : 'text-emerald-600')}>
                            {isOver ? '+' : ''}{fmt(cat.variance)}
                          </span>
                        </div>
                      </div>
                      <div className="prog-bar h-2">
                        <div className={cn('prog-fill', pct > 85 ? 'bg-red-400' : pct > 70 ? 'bg-amber-400' : 'bg-indigo-400')}
                          style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Priority alignment */}
            <div className="card p-5">
              <p className="section-header">Budget → Priority Alignment</p>
              <p className="text-xs text-slate-400 mb-4 -mt-2">What % of budget is funding strategic priorities vs. BAU?</p>
              <div className="space-y-3">
                {priorityBudgetMap.map(p => (
                  <div key={p.priority}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-700 truncate flex-1 mr-2">{p.priority}</span>
                      <div className="flex items-center gap-2 text-[11px] shrink-0">
                        <span className="text-slate-500">{p.allocation}</span>
                        <span className="font-medium text-slate-700">{p.pct}%</span>
                      </div>
                    </div>
                    <div className="prog-bar h-2">
                      <div className={cn('prog-fill', p.pct > 50 ? 'bg-slate-300' : 'bg-[#00856F]')}
                        style={{ width: `${Math.min(p.pct * 1.2, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-700"><strong>Insight:</strong> 76% of budget is BAU / core operations. Strategic initiatives collectively represent only 24% of spend. T&E variance is in BAU and integration travel.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PEOPLE TAB ── */}
      {tab === 'people' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Planned HC',     value: budgetData.headcount.planned, cls: 'text-slate-800' },
              { label: 'Current HC',     value: budgetData.headcount.current, cls: 'text-slate-800' },
              { label: 'Open Roles',     value: budgetData.headcount.open,    cls: 'text-amber-600' },
              { label: 'Attrition YTD', value: `${attritionData.voluntaryAttritionYTD}%`, cls: 'text-red-600' },
            ].map(m => (
              <div key={m.label} className="card p-4">
                <p className={cn('text-2xl font-bold', m.cls)}>{m.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Attrition vs target */}
          <div className="card p-5 border-l-4 border-l-red-400">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Voluntary Attrition — Watch</h3>
                <p className="text-xs text-slate-500 mt-0.5">Trending above target, accelerating since acquisition announcement (Jun 2026)</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold text-red-600">{attritionData.voluntaryAttritionYTD}%</p>
                <p className="text-[10px] text-slate-400">Target: {attritionData.attritionTarget}%</p>
              </div>
            </div>
            <div className="prog-bar h-2.5 mb-3">
              <div className="prog-fill bg-red-400" style={{ width: `${(attritionData.voluntaryAttritionYTD / 10) * 100}%` }} />
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown size={14} className="text-red-500" />
              <span className="text-xs text-red-600 font-medium">Worsening — pulse sentiment down 8pts vs. pre-announcement baseline</span>
            </div>
          </div>

          {/* Hiring pipeline */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Hiring Pipeline (30 open roles)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Not sourced',   value: attritionData.notSourced, cls: 'text-red-600', bg: 'bg-red-50 border-red-100' },
                { label: 'In process',    value: attritionData.inProcess,  cls: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
                { label: 'Offer stage',   value: attritionData.offerStage, cls: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
                { label: 'Critical >60d', value: attritionData.criticalRolesOpenOver60Days, cls: 'text-red-600', bg: 'bg-red-50 border-red-100' },
              ].map(m => (
                <div key={m.label} className={cn('rounded-xl p-3 border', m.bg)}>
                  <p className={cn('text-xl font-bold', m.cls)}>{m.value}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>

            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
              Critical Roles Open &gt;60 Days
            </h4>
            <div className="space-y-2">
              {attritionData.recentDepartures.map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800">{d.role}</p>
                    <p className="text-[10px] text-slate-400">{d.function}</p>
                  </div>
                  <span className={cn('badge', d.daysVacant > 60 ? 'badge-risk' : 'badge-watch')}>
                    {d.daysVacant}d vacant
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* HC by function */}
          <div className="card p-5">
            <p className="section-header">Headcount by Function</p>
            <div className="space-y-3">
              {budgetData.headcount.byFunction.map(fn => {
                const pct = Math.round((fn.current / fn.planned) * 100)
                return (
                  <div key={fn.function}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-700">{fn.function}</span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{fn.current}/{fn.planned}</span>
                        {fn.open > 0 && <span className="badge badge-watch">{fn.open} open</span>}
                      </div>
                    </div>
                    <div className="prog-bar h-2">
                      <div className={cn('prog-fill', pct < 90 ? 'bg-amber-400' : 'bg-[#00856F]')}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
