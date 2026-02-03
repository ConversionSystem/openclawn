import { Routes, Route } from 'react-router-dom'
import { AuthGuard } from '@/components/auth/AuthGuard'
import HomePage from '@/pages/index'
import LoginPage from '@/pages/login'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <AuthGuard>
            <HomePage />
          </AuthGuard>
        }
      />
    </Routes>
  )
}
