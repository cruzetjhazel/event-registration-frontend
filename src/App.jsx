import { useMemo } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { EventList } from "./pages/EventList"
import { About } from "./pages/About"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { EventDetails } from "./pages/EventDetails"
import { Calendar } from "./pages/Calendar"
import { Pages } from "./pages/Pages"
import { UserDashboard } from "./pages/Dashboard/UserDashboard"
import { UserProfile } from "./pages/Dashboard/UserProfile"
import { OrganizerDashboard } from "./pages/Dashboard/OrganizerDashboard"
import { AdminDashboard } from "./pages/Dashboard/AdminDashboard"

const Contact = () => (
  <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col justify-center px-4 text-center text-white">
    <h1 className="text-3xl font-semibold">Contact</h1>
    <p className="mt-3 text-slate-200">Reach us at contact@example.com or visit our offices for more info.</p>
  </div>
)

const App = () => {
  const isAuthenticated = useMemo(() => Boolean(localStorage.getItem("auth_token")), [])

  return (
    <Routes>
      <Route path="/" element={<EventList isAuthenticated={isAuthenticated} />} />
      <Route path="/events" element={<EventList isAuthenticated={isAuthenticated} />} />
      <Route path="/event/:id" element={<EventDetails />} />
      <Route path="/calendar" element={<Calendar isAuthenticated={isAuthenticated} />} />
      <Route path="/pages" element={<Pages isAuthenticated={isAuthenticated} />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Navigate to="/dashboard/user" replace />} />
      <Route path="/dashboard/user" element={<ProtectedRoute element={<UserDashboard />} requiredRole="user" />} />
      <Route path="/dashboard/user/profile" element={<ProtectedRoute element={<UserProfile />} requiredRole="user" />} />
      <Route path="/dashboard/organizer" element={<ProtectedRoute element={<OrganizerDashboard />} requiredRole="organizer" />} />
      <Route path="/dashboard/admin" element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />} />
      <Route path="*" element={<Navigate to="/events" replace />} />
    </Routes>
  )
}

export default App
