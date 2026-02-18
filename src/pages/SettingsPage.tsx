import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile, useUpdateProfile, useAuth } from '@/hooks';
import {
  User,
  Wallet,
  LogOut,
  Bell,
  Shield,
  ChevronRight,
} from 'lucide-react';

const CURRENCY_OPTIONS = [
  { value: 'CNY', label: '人民币 (CNY)' },
  { value: 'USD', label: '美元 (USD)' },
  { value: 'HKD', label: '港币 (HKD)' },
] as const;

export function SettingsPage() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();
  const { user, signOut } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [currency, setCurrency] = useState('CNY');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? '');
      setCurrency(profile.currency ?? 'CNY');
    }
  }, [profile]);

  const handleSave = () => {
    updateMutation.mutate({
      display_name: displayName.trim() || null,
      currency,
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const errorMessage =
    updateMutation.error instanceof Error ? updateMutation.error.message : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight">设置</h1>
        <p className="text-muted-foreground">管理您的账户和偏好设置</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">个人资料</CardTitle>
                  <CardDescription>管理您的显示名称和偏好</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {errorMessage}
                </div>
              )}

              {updateMutation.isSuccess && (
                <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700 border border-emerald-200">
                  设置已保存
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="displayName">昵称</Label>
                <Input
                  id="displayName"
                  placeholder="例如：财富达人"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isLoading || updateMutation.isPending}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="currency">默认货币</Label>
                <select
                  id="currency"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  disabled={isLoading || updateMutation.isPending}
                >
                  {CURRENCY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  当前版本默认按 CNY 进行金额显示（含「万」的简写）
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSave}
                  disabled={isLoading || updateMutation.isPending}
                >
                  {updateMutation.isPending ? '保存中...' : '保存设置'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">账户安全</CardTitle>
                  <CardDescription>管理您的登录凭据</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">邮箱地址</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                  已验证
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-t">
                <div>
                  <p className="font-medium">修改密码</p>
                  <p className="text-sm text-muted-foreground">
                    定期更换密码可以保护账户安全
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/forgot-password')}>
                  修改
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          {/* Account Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">账户信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {(displayName || user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{displayName || user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">快捷入口</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <button
                onClick={() => navigate('/accounts')}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b"
              >
                <div className="flex items-center gap-3">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">管理资产账户</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => navigate('/cashflow')}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b"
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">查看收支记录</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Card className="border-destructive/20">
            <CardContent className="p-4">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
