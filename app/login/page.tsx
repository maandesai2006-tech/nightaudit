'use client'

import { useRouter } from 'next/navigation'
import { Building2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const basePath = '/nightaudit'

  const handleLogin = () => {
    router.push(`${basePath}/dashboard`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card-static screws p-10 w-full max-w-md text-center animate-fade-up">
        {/* Logo */}
        <div className="w-16 h-16 rounded-full shadow-floating bg-[#e0e5ec] flex items-center justify-center mx-auto mb-6">
          <Building2 size={28} className="text-[#ff4757]" />
        </div>

        <h1 className="text-2xl font-extrabold text-[#2d3436] tracking-tight mb-1" style={{ textShadow: '0 1px 0 #fff' }}>
          NightAudit
        </h1>
        <p className="text-xs text-[#4a5568] font-mono uppercase tracking-wider mb-8">
          Hotel Portfolio Intelligence
        </p>

        {/* Demo notice */}
        <div className="shadow-recessed rounded-xl p-4 mb-6">
          <p className="text-xs text-[#4a5568] leading-relaxed">
            This is a <span className="font-bold text-[#ff4757]">demo version</span> with mock data.
            Click below to explore the dashboard as a portfolio owner.
          </p>
        </div>

        <div className="space-y-3">
          <input className="input" value="maan@nightaudit.app" readOnly />
          <input className="input" type="password" value="demo-password" readOnly />
        </div>

        <button onClick={handleLogin} className="btn btn-primary w-full mt-6">
          Enter Dashboard
        </button>

        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full led-green animate-pulse" />
          <span className="font-mono text-[9px] text-[#4a5568] uppercase tracking-wider font-bold">Demo Mode Active</span>
        </div>
      </div>
    </div>
  )
}
