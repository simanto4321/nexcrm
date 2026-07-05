import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ChatBubble from './components/ChatBubble'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import { AdminRoute, ProtectedRoute } from './components/ProtectedRoute'
import ContactsPage from './pages/ContactsPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import PipelinePage from './pages/PipelinePage'
import PlatformAdminPage from './pages/PlatformAdminPage'
import SettingsPage from './pages/SettingsPage'
import SignupPage from './pages/SignupPage'
import TasksPage from './pages/TasksPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
        <ChatBubble />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/platform-admin" element={<PlatformAdminPage />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
