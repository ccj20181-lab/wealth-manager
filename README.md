# 个人财富管家

一款面向中国用户的精致个人财富管理系统，帮助您统一管理资产账户、基金投资、现金流和投资目标。

## ✨ 功能特性

- **📊 资产仪表盘** - 总资产概览、净值走势、资产配置可视化
- **🏦 资产账户** - 统一管理银行卡、支付宝、微信、现金、基金账户等
- **📈 基金投资** - 持仓管理、交易记录、定投计划
- **💰 现金流管理** - 收支记录、分类统计、预算管理
- **🎯 投资目标** - 目标设定、进度追踪、提醒功能
- **📑 报表中心** - 收支趋势、支出结构、资产配置分析

## 🛠 技术栈

- **前端**: React 19 + Vite 7 + TypeScript 5
- **样式**: Tailwind CSS v4 + shadcn/ui
- **状态管理**: Zustand + TanStack Query (React Query)
- **图表**: Recharts
- **表单**: React Hook Form + Zod
- **后端**: Supabase (PostgreSQL + Auth)
- **部署**: Cloudflare Pages (推荐)

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd wealth-manager
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 Supabase

1. 前往 [Supabase](https://supabase.com) 创建新项目
2. 在 SQL Editor 中执行 `supabase/migrations/` 目录下的所有迁移文件
3. 开启 Email 认证（Authentication → Providers → Email）
4. 复制项目 URL 和 Anon Key 到 `.env` 文件

```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

## 📦 构建部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

构建完成后，将 `dist` 目录部署到 Cloudflare Pages 或其他静态托管服务。

## 📁 项目结构

```
src/
├── components/
│   ├── ui/           # 基础 UI 组件 (shadcn)
│   ├── charts/       # 图表组件
│   ├── dashboard/    # 仪表盘组件
│   ├── funds/        # 基金模块组件
│   ├── cashflow/     # 现金流组件
│   └── goals/        # 目标管理组件
├── hooks/            # React Query hooks
├── layouts/          # 布局组件
├── lib/              # 工具库
├── pages/            # 页面组件
│   ├── LoginPage.tsx         # 登录
│   ├── RegisterPage.tsx      # 注册
│   ├── ForgotPasswordPage.tsx # 忘记密码
│   ├── ResetPasswordPage.tsx  # 重置密码
│   ├── DashboardPage.tsx      # 仪表盘
│   ├── AccountsPage.tsx       # 资产账户
│   ├── FundsPage.tsx          # 基金投资
│   ├── CashflowPage.tsx       # 现金流
│   ├── GoalsPage.tsx          # 投资目标
│   ├── ReportsPage.tsx        # 报表中心
│   └── SettingsPage.tsx       # 设置
├── services/api/     # API 服务层
└── types/            # TypeScript 类型
```

## 🔐 认证流程

本项目使用 Supabase Auth 提供完整的认证系统：

1. **注册** - 邮箱 + 密码注册，发送验证邮件
2. **登录** - 邮箱 + 密码登录
3. **忘记密码** - 发送重置密码邮件
4. **重置密码** - 通过邮件链接设置新密码

## 🎨 界面设计

采用「暖纸 + 墨色 + 朱/青点缀」的审美风格：

- 温暖的米白色背景，营造舒适感
- 深色文字确保可读性
- 红色（朱）用于主要操作和强调
- 青色用于次要信息和成功状态
- 支持万/亿单位的人民币金额显示

## 📝 数据库迁移

执行以下 SQL 文件初始化数据库：

1. `001_initial_schema.sql` - 初始表结构
2. `002_functions.sql` - 函数和存储过程
3. `003_seed_data.sql` - 初始数据
4. `004_rls_policies.sql` - 行级安全策略
5. `005_security_and_funds_policies.sql` - 安全加固和基金策略

## 🔒 安全说明

- 所有数据库操作通过 RLS（行级安全）保护
- 用户只能访问自己的数据
- 密码使用 bcrypt 加密存储
- 支持 JWT Token 自动刷新

## 🐛 常见问题

### Q: 注册后收不到验证邮件？
A: 请检查垃圾邮件文件夹，或在 Supabase 控制台查看邮件发送日志。

### Q: 如何修改货币单位？
A: 在「设置」页面可以切换货币单位（当前仅支持显示格式，汇率转换功能开发中）。

### Q: 基金代码查询不到？
A: 可以手动输入基金名称创建，系统会自动保存到基金库。

## 📄 许可证

MIT License

---

由 Claude Code 精心打造 ❤️
