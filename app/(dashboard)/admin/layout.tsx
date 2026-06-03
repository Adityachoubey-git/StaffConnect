import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    redirect('/user/dashboard')
  }

  return <DashboardShell user={user}>{children}</DashboardShell>
}
