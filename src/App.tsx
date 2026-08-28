import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ExecutiveOverview from './pages/ExecutiveOverview'
import MyDay from './pages/MyDay'
import Decisions from './pages/Decisions'
import Meetings from './pages/Meetings'
import PrioritiesOKRs from './pages/PrioritiesOKRs'
import Projects from './pages/Projects'
import Markets from './pages/Markets'
import SalesPayments from './pages/SalesPayments'
import PeopleBudget from './pages/PeopleBudget'
import Intelligence from './pages/Intelligence'
import AcquisitionIntegration from './pages/AcquisitionIntegration'
import Actions from './pages/Actions'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
// Legacy pages kept for backward compat
import StrategicPriorities from './pages/StrategicPriorities'
import OKRs from './pages/OKRs'
import Risks from './pages/Risks'
import Signals from './pages/Signals'
import OpportunityLab from './pages/OpportunityLab'
import StrategicObservations from './pages/StrategicObservations'
import Budget from './pages/Budget'
import Stakeholders from './pages/Stakeholders'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ExecutiveOverview />} />
          <Route path="my-day" element={<MyDay />} />
          <Route path="decisions" element={<Decisions />} />
          <Route path="actions" element={<Actions />} />
          <Route path="meetings" element={<Meetings />} />
          <Route path="priorities" element={<PrioritiesOKRs />} />
          <Route path="projects" element={<Projects />} />
          <Route path="markets" element={<Markets />} />
          <Route path="sales-payments" element={<SalesPayments />} />
          <Route path="people-budget" element={<PeopleBudget />} />
          <Route path="intelligence" element={<Intelligence />} />
          <Route path="acquisition-integration" element={<AcquisitionIntegration />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          {/* Legacy routes */}
          <Route path="priorities-old" element={<StrategicPriorities />} />
          <Route path="okrs" element={<OKRs />} />
          <Route path="risks" element={<Risks />} />
          <Route path="signals" element={<Signals />} />
          <Route path="opportunities" element={<OpportunityLab />} />
          <Route path="observations" element={<StrategicObservations />} />
          <Route path="budget" element={<Budget />} />
          <Route path="stakeholders" element={<Stakeholders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
