'use client'

import NavBar from '@/components/ui/NavBar'
import { CURRENT_USER } from '@/lib/mock/data'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <NavBar user={{ name: CURRENT_USER.name, role: CURRENT_USER.role, email: CURRENT_USER.email }} />
      <main>{children}</main>
    </div>
  )
}
