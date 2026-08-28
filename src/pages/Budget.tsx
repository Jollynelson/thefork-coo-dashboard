import { DollarSign } from 'lucide-react'
import { cn } from '../lib/cn'
import { budgetData } from '../data/mockData'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const fmt = (v: number) =>
  v >= 1_000_000 ? `€${(v / 1_000_000).toFixed(1)}M` : `€${(v / 1_000).toFixed(0)}k`

export default function Budget() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Budget & Resources</h1>
        <p className="page-subtitle">FY2024 budget tracking, headcount, and variance analysis. All figures are illustrative.</p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Annual Budget', value: fmt(budgetData.annual),     sub: 'FY2024 plan',          cls: 'text-slate-800' },
          { label: 'YTD Actual',    value: fmt(budgetData.ytdActual),  sub: `${Math.round(budgetData.ytdActual/budgetData.annual*100)}% consumed`, cls: 'text-slate-800' },
          { label: 'FY Forecast',   value: fmt(budgetData.fyForecast), sub: `+${budgetData.variancePct}% vs. plan`, cls: 'text-red-600' },
          { label: 'Variance',      value: `+${fmt(budgetData.variance)}`, sub: 'Over budget',      cls: 'text-red-600' },
        ].map(m => (
          <div key={m.label} className="card p-4">
            <p className={cn('text-xl font-bold', m.cls)}>{m.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
            <p className="text-[10px] text-slate-400">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Monthly trend */}
        <div className="card p-5">
          <p className="section-header">Monthly Spend vs. Budget</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={budgetData.monthlyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gAct2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" tickLine={false} axisLine={false}
                tickFormatter={v => `€${(v/1e6).toFixed(1)}M`} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                formatter={(v: number) => [fmt(v)]} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="budget" name="Budget" stroke="#6366F1" fill="none" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
              <Area type="monotone" dataKey="actual" name="Actual" stroke="#F59E0B" fill="url(#gAct2)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
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
      </div>

      {/* Headcount */}
      <div className="card p-5">
        <p className="section-header">Headcount by Function</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Planned',    value: budgetData.headcount.planned,   cls: 'text-slate-800' },
            { label: 'Current',    value: budgetData.headcount.current,   cls: 'text-slate-800' },
            { label: 'Open Roles', value: budgetData.headcount.open,      cls: 'text-amber-600' },
            { label: 'Fill Rate',  value: `${Math.round(budgetData.headcount.current/budgetData.headcount.planned*100)}%`, cls: 'text-slate-700' },
          ].map(m => (
            <div key={m.label} className="bg-slate-50 rounded-xl p-3.5">
              <p className={cn('text-xl font-bold', m.cls)}>{m.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
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
                  <div className={cn('prog-fill', pct < 90 ? 'bg-amber-400' : 'bg-indigo-400')}
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
