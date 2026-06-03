'use client'

import { SessionUser } from '@/types'
import { UserNav } from './user-nav'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Calendar,
  UserCog
} from 'lucide-react'

interface DashboardShellProps {
  user: SessionUser
  children: React.ReactNode
}

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname()

  const getNavItems = (): NavItem[] => {
    if (user.role === 'SUPER_ADMIN') {
      return [
        { title: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
        { title: 'Users', href: '/super-admin/users', icon: Users },
        { title: 'Leave Approval', href: '/super-admin/leave-approval', icon: FileText },
        { title: 'Leave Quota', href: '/super-admin/quota', icon: Settings },
      ]
    } else if (user.role === 'ADMIN') {
      return [
        { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { title: 'Leave Approval', href: '/admin/leave-approval', icon: FileText },
        { title: 'Users', href: '/admin/users', icon: Users },
      ]
    } else {
      return [
        { title: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
        { title: 'My Leaves', href: '/user/leaves', icon: Calendar },
        { title: 'My Team', href: '/user/team', icon: UserCog },
      ]
    }
  }

  const navItems = getNavItems()

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#163A60] bg-[#0F2B48] text-white">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="StaffConnect Logo" className="h-8 w-auto object-contain" />
            <span className="font-bold tracking-tight text-xl text-white">
              Staff<span className="text-[#42C6FF] ml-0.5">Connect</span>
            </span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <UserNav user={user} />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r border-[#163A60] bg-[#0F2B48] min-h-[calc(100vh-4rem)]">
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-[#3274D5] text-white shadow-sm'
                      : 'text-slate-300 hover:bg-[#163A60] hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
