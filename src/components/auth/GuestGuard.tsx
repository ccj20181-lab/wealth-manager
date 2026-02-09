import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface GuestGuardProps {
  children: React.ReactNode
}

export function GuestGuard({ children }: GuestGuardProps) {
  const { user, isLoading, isInitialized } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (isInitialized && !isLoading && user) {
      // Redirect to the page they were trying to access, or dashboard
      const from = (location.state as { from?: string })?.from || '/'
      navigate(from, { replace: true })
    }
  }, [user, isLoading, isInitialized, navigate, location])

  // Show loading state while checking auth
  if (!isInitialized || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if authenticated
  if (user) {
    return null
  }

  return <>{children}</>
}
