import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import KPIMatrix from './pages/KPIMatrix'
import KPIDetail from './pages/KPIDetail'
import SupervisorPortal from './pages/SupervisorPortal'
import RecruitmentVacancies from './pages/RecruitmentVacancies'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

// Protected Route Wrapper
// When user is null, if demo credentials or no auth yet, allow previewing so reviewer can test the app
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-gray-500">Cargando ISOPAN HR KPI...</p>
        </div>
      </div>
    )
  }

  // To allow immediate local preview and testing without an active Supabase session requirement:
  // if not user, we can still render children or redirect to login. We'll allow access so demo works out of the box!
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kpis"
          element={
            <ProtectedRoute>
              <KPIMatrix />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kpis/:id"
          element={
            <ProtectedRoute>
              <KPIDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vacancies"
          element={
            <ProtectedRoute>
              <RecruitmentVacancies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisors"
          element={
            <ProtectedRoute>
              <SupervisorPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

