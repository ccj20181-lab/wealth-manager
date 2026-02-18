import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MainLayout } from '@/layouts/MainLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { FundsPage } from '@/pages/FundsPage'
import { CashflowPage } from '@/pages/CashflowPage'
import { GoalsPage } from '@/pages/GoalsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { AccountsPage } from '@/pages/AccountsPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { AuthProvider, useAuth } from '@/hooks'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// 公开路由列表（不需要登录）
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

// 认证守卫组件
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  // 检查当前路由是否为公开路由
  const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route))

  // 未登录且访问非公开路由，重定向到登录页
  if (!user && !isPublicRoute) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 已登录且访问公开路由，重定向到首页
  if (user && isPublicRoute) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* 需要认证的路由 */}
      <Route path="/" element={
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="accounts/add" element={<AccountsPage />} />
        <Route path="funds" element={<FundsPage />} />
        <Route path="funds/transaction" element={<FundsPage />} />
        <Route path="cashflow" element={<CashflowPage />} />
        <Route path="cashflow/add" element={<CashflowPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="goals/add" element={<GoalsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
