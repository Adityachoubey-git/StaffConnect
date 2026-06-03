import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'SUPER_ADMIN') {
    redirect(user.role === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard')
  }

  return <DashboardShell user={user}>{children}</DashboardShell>
}
