import { useState } from 'react'
import { X, CheckSquare, CalendarDays, ListTodo, FolderKanban, AlertTriangle, Users, Lightbulb, Telescope, ChevronDown } from 'lucide-react'
import { cn } from '../lib/cn'
import { useToast, ToastContainer } from './Toast'

type ItemType = 'Decision' | 'Meeting' | 'Action' | 'Project' | 'Risk' | 'Stakeholder' | 'Opportunity' | 'Observation'

const typeIcons: Record<ItemType, typeof CheckSquare> = {
  Decision:    CheckSquare,
  Meeting:     CalendarDays,
  Action:      ListTodo,
  Project:     FolderKanban,
  Risk:        AlertTriangle,
  Stakeholder: Users,
  Opportunity: Lightbulb,
  Observation: Telescope,
}

const typeColors: Record<ItemType, string> = {
  Decision:    'bg-orange-50 border-orange-200 text-orange-700',
  Meeting:     'bg-blue-50 border-blue-200 text-blue-700',
  Action:      'bg-slate-50 border-slate-200 text-slate-700',
  Project:     'bg-indigo-50 border-indigo-200 text-indigo-700',
  Risk:        'bg-red-50 border-red-200 text-red-700',
  Stakeholder: 'bg-purple-50 border-purple-200 text-purple-700',
  Opportunity: 'bg-amber-50 border-amber-200 text-amber-700',
  Observation: 'bg-emerald-50 border-emerald-200 text-emerald-700',
}

interface Props {
  open: boolean
  itemType: ItemType | null
  onClose: () => void
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10.5px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
        {label} {required && <span className="text-red-400 normal-case tracking-normal font-normal">*</span>}
      </label>
      {children}
    </div>
  )
}

function Input({ placeholder, defaultValue = '' }: { placeholder?: string; defaultValue?: string }) {
  return (
    <input
      className="input"
      placeholder={placeholder}
      defaultValue={defaultValue}
    />
  )
}

function Textarea({ placeholder, rows = 2 }: { placeholder?: string; rows?: number }) {
  return (
    <textarea
      className="input resize-none"
      placeholder={placeholder}
      rows={rows}
      style={{ minHeight: `${rows * 1.6 + 1}rem` }}
    />
  )
}

function Select({ options, placeholder }: { options: string[]; placeholder?: string }) {
  return (
    <div className="relative">
      <select className="input appearance-none pr-8 bg-white cursor-pointer">
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  )
}

function DecisionForm() {
  return (
    <div className="space-y-3.5">
      <Field label="Decision Title" required><Input placeholder="What needs to be decided?" /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Field label="Decision Owner" required><Input placeholder="Who owns this decision?" /></Field>
        <Field label="Decision Maker" required><Input placeholder="Who makes the final call?" /></Field>
      </div>
      <Field label="Why Now" required><Textarea placeholder="Why does this need a decision now? What's the cost of delay?" rows={2} /></Field>
      <Field label="Context"><Textarea placeholder="Background, options considered, supporting data…" rows={2} /></Field>
      <Field label="Recommendation"><Input placeholder="What do you recommend?" /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Field label="Priority" required>
          <Select options={['Critical', 'High', 'Medium', 'Low']} placeholder="Select priority" />
        </Field>
        <Field label="Deadline" required><input type="date" className="input" /></Field>
        <Field label="Category">
          <Select options={['Operations', 'Sales', 'Payments', 'Technology', 'Finance', 'Integration', 'HR', 'Legal']} placeholder="Category" />
        </Field>
      </div>
    </div>
  )
}

function MeetingForm() {
  return (
    <div className="space-y-3.5">
      <Field label="Meeting Title" required><Input placeholder="What is this meeting about?" /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Field label="Date" required><input type="date" className="input" /></Field>
        <Field label="Time" required><input type="time" className="input" defaultValue="09:00" /></Field>
        <Field label="Duration (min)">
          <Select options={['30', '45', '60', '90', '120']} placeholder="Duration" />
        </Field>
      </div>
      <Field label="Type">
        <Select options={['ELT', 'Market', 'Finance', 'Board Prep', 'Strategic Project', 'Integration / steering committee', 'Operations', 'Sales', 'Payments', 'External']} placeholder="Meeting type" />
      </Field>
      <Field label="Objective" required><Textarea placeholder="What is the objective of this meeting?" rows={2} /></Field>
      <Field label="Participants"><Input placeholder="Who should attend? (comma separated)" /></Field>
      <Field label="Location / Link"><Input placeholder="Room name or video call link" /></Field>
    </div>
  )
}

function ActionForm() {
  return (
    <div className="space-y-3.5">
      <Field label="Action" required><Input placeholder="What needs to be done?" /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Field label="Owner" required><Input placeholder="Who is responsible?" /></Field>
        <Field label="Due Date" required><input type="date" className="input" /></Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Field label="Priority" required>
          <Select options={['Critical', 'High', 'Medium', 'Low']} placeholder="Select priority" />
        </Field>
        <Field label="Source"><Input placeholder="Which meeting, decision or project?" /></Field>
      </div>
      <Field label="Related Decision / Project"><Input placeholder="Link to a decision or project (optional)" /></Field>
      <Field label="Notes"><Textarea placeholder="Any additional context…" rows={2} /></Field>
    </div>
  )
}

function ProjectForm() {
  return (
    <div className="space-y-3.5">
      <Field label="Project Name" required><Input placeholder="What is this project called?" /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Field label="Sponsor" required><Input placeholder="Executive sponsor" /></Field>
        <Field label="Project Lead" required><Input placeholder="Who leads delivery?" /></Field>
      </div>
      <Field label="Description"><Textarea placeholder="What problem does this project solve? What is the outcome?" rows={2} /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Field label="Start Date"><input type="date" className="input" /></Field>
        <Field label="End Date"><input type="date" className="input" /></Field>
        <Field label="Status">
          <Select options={['On Track', 'Watch', 'At Risk', 'Not Started']} placeholder="Status" />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Field label="Budget"><Input placeholder="e.g. €250k" /></Field>
        <Field label="Markets / Functions"><Input placeholder="e.g. France, Spain / Product, Engineering" /></Field>
      </div>
    </div>
  )
}

function RiskForm() {
  return (
    <div className="space-y-3.5">
      <Field label="Risk Title" required><Input placeholder="Describe the risk in one sentence" /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Field label="Category" required>
          <Select options={['Operations', 'Sales', 'Payments', 'Technology', 'Financial', 'People', 'Regulatory', 'Integration']} placeholder="Category" />
        </Field>
        <Field label="Market">
          <Select options={['Global', 'France', 'Spain & Iberia', 'Italy', 'UK & Ireland', 'DACH & Nordics', 'Rest of Footprint']} placeholder="Market" />
        </Field>
      </div>
      <Field label="Description"><Textarea placeholder="What is the risk and why does it matter?" rows={2} /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Field label="Probability">
          <Select options={['High', 'Medium', 'Low']} placeholder="Probability" />
        </Field>
        <Field label="Impact">
          <Select options={['Critical', 'High', 'Medium', 'Low']} placeholder="Impact" />
        </Field>
        <Field label="Owner" required><Input placeholder="Risk owner" /></Field>
      </div>
      <Field label="Mitigation Plan"><Textarea placeholder="How are we mitigating this risk?" rows={2} /></Field>
      <Field label="Due Date"><input type="date" className="input" /></Field>
    </div>
  )
}

function StakeholderForm() {
  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Field label="Name" required><Input placeholder="Full name" /></Field>
        <Field label="Role" required><Input placeholder="Job title / role" /></Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Field label="Function" required>
          <Select options={['Board', 'ELT', 'Finance', 'Technology', 'Operations', 'Sales', 'Payments', 'Product', 'Marketing', 'Legal', 'HR', 'Integration', 'Labor Relations', 'External']} placeholder="Function" />
        </Field>
        <Field label="Market">
          <Select options={['Global', 'France', 'Spain & Iberia', 'Italy', 'UK & Ireland', 'DACH & Nordics', 'Rest of Footprint']} placeholder="Market" />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Field label="Relationship Health">
          <Select options={['Strong', 'Healthy', 'Watch', 'Needs Attention']} placeholder="Health" />
        </Field>
        <Field label="Influence">
          <Select options={['High', 'Medium', 'Low']} placeholder="Influence level" />
        </Field>
      </div>
      <Field label="Current Priority / Context"><Textarea placeholder="What is this person focused on right now? Any open issues?" rows={2} /></Field>
      <Field label="Next Interaction Date"><input type="date" className="input" /></Field>
    </div>
  )
}

function OpportunityForm() {
  return (
    <div className="space-y-3.5">
      <Field label="Opportunity Title" required><Input placeholder="What is the opportunity?" /></Field>
      <Field label="Problem" required><Textarea placeholder="What problem does this solve? For whom?" rows={2} /></Field>
      <Field label="Evidence"><Textarea placeholder="What data, signals, or observations support this?" rows={2} /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Field label="Target User"><Input placeholder="Who benefits? (diner / restaurant / B2B)" /></Field>
        <Field label="Owner"><Input placeholder="Who should own this?" /></Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Field label="Strategic Alignment">
          <Select options={['High', 'Medium', 'Low']} placeholder="Alignment" />
        </Field>
        <Field label="Effort">
          <Select options={['Low', 'Medium', 'High']} placeholder="Effort" />
        </Field>
        <Field label="Confidence">
          <Select options={['High', 'Medium', 'Low']} placeholder="Confidence" />
        </Field>
      </div>
      <Field label="Proposed Experiment"><Textarea placeholder="What is the smallest experiment to validate this?" rows={2} /></Field>
      <Field label="Success Metric"><Input placeholder="How would you know it worked?" /></Field>
    </div>
  )
}

function ObservationForm() {
  return (
    <div className="space-y-3.5">
      <p className="text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-lg p-3 leading-relaxed">
        <strong className="text-amber-700">Independent hypotheses only.</strong> These are not statements about TheFork's internal performance or confirmed company priorities.
      </p>
      <Field label="Title" required><Input placeholder="What is your observation about?" /></Field>
      <Field label="Observation" required><Textarea placeholder="What did you observe? Be specific." rows={3} /></Field>
      <Field label="Why It Caught Your Attention"><Textarea placeholder="Why does this matter right now?" rows={2} /></Field>
      <Field label="Hypothesis"><Textarea placeholder="If this observation is correct, what does it imply?" rows={2} /></Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Field label="Potential User Value"><Input placeholder="Value to diners / restaurant partners" /></Field>
        <Field label="Potential Business Value"><Input placeholder="Revenue / efficiency / strategic value" /></Field>
      </div>
      <Field label="Label">
        <Select options={['Candidate hypothesis', 'Worth investigating', 'Potential experiment']} placeholder="Label" />
      </Field>
      <Field label="Proposed Small Experiment"><Input placeholder="What would you test first?" /></Field>
      <Field label="Success Metric"><Input placeholder="How would you measure success?" /></Field>
    </div>
  )
}

const forms: Record<ItemType, React.ReactNode> = {
  Decision:    <DecisionForm />,
  Meeting:     <MeetingForm />,
  Action:      <ActionForm />,
  Project:     <ProjectForm />,
  Risk:        <RiskForm />,
  Stakeholder: <StakeholderForm />,
  Opportunity: <OpportunityForm />,
  Observation: <ObservationForm />,
}

export default function QuickAddModal({ open, itemType, onClose }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const { toasts, toast, remove } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      toast(`${itemType} added successfully.`)
      onClose()
    }, 600)
  }

  if (!open || !itemType) return null

  const Icon = typeIcons[itemType]
  const colorCls = typeColors[itemType]

  return (
    <>
      <ToastContainer toasts={toasts} remove={remove} />
      <div className="fixed inset-0 z-[400] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-6 sm:pt-12 overflow-y-auto">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 animate-slide-in">
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
            <div className="flex items-center gap-3">
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg border', colorCls)}>
                <Icon size={15} />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Add {itemType}</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="px-5 sm:px-6 py-5">
              {forms[itemType]}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <p className="text-[10.5px] text-slate-400">
                Fields marked * are required. Data is illustrative only.
              </p>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitted}
                  className="btn-primary"
                  style={{ background: submitted ? '#006B5A' : '#00856F' }}
                >
                  {submitted ? 'Saving…' : `Add ${itemType}`}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
