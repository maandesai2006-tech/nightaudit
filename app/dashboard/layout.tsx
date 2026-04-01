'use client'

import NavBar from '@/components/ui/NavBar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <NavBar user={{ name: 'Maan Desai', role: 'owner', email: 'maan@nightaudit.app' }} />
      <main>{children}</main>
    </div>
  )
}
