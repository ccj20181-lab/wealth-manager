import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  PiggyBank,
  TrendingUp,
  ArrowLeftRight,
  Target,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth, useProfile } from '@/hooks'

const navigation = [
  { name: '仪表盘', href: '/', icon: LayoutDashboard },
  { name: '资产账户', href: '/accounts', icon: PiggyBank },
  { name: '基金投资', href: '/funds', icon: TrendingUp },
  { name: '现金流', href: '/cashflow', icon: ArrowLeftRight },
  { name: '投资目标', href: '/goals', icon: Target },
  { name: '报表', href: '/reports', icon: FileText },
  { name: '设置', href: '/settings', icon: Settings },
]

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { data: profile } = useProfile()

  const pageTitle =
    navigation.find((n) => (n.href === '/' ? location.pathname === '/' : location.pathname.startsWith(n.href)))?.name ||
    'Wealth Manager'

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const userDisplayName = profile?.display_name || user?.email?.split('@')[0] || '用户'
  const userEmail = user?.email || ''

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card/80 backdrop-blur border-r border-border/70 transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <div className="min-w-0">
            <h1 className="text-xl font-bold font-display tracking-tight truncate">财富管家</h1>
            <p className="text-xs text-muted-foreground truncate">个人资产 · 现金流 · 基金 · 目标</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className={cn("h-5 w-5", "transition-transform duration-200")} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* User info in sidebar */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{userDisplayName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={handleSignOut}
              title="退出登录"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/70 backdrop-blur px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{pageTitle}</div>
            <div className="text-xs text-muted-foreground truncate">
              个人财富管理系统
            </div>
          </div>

          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="hidden sm:inline text-sm font-medium">{userDisplayName}</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", userMenuOpen && "rotate-180")} />
            </Button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-card shadow-lg z-50 py-1">
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm font-medium">{userDisplayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                  </div>
                  <NavLink
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    设置
                  </NavLink>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      handleSignOut()
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    退出登录
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
