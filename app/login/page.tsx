'use client'

import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card-static p-8 w-full max-w-sm text-center space-y-6">
        <div>
          <div className="dot-live mx-auto mb-3" />
          <h1 className="font-mono text-sm font-bold uppercase tracking-[0.1em] text-[var(--text)]">NightAudit</h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">Hotel Portfolio Dashboard</p>
        </div>

        <div className="space-y-3">
          <input className="input" placeholder="Email" defaultValue="maan@nightaudit.app" />
          <input className="input" type="password" placeholder="Password" defaultValue="demo" />
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="btn btn-primary w-full"
        >
          Sign In
        </button>

        <p className="text-[0.6rem] text-[var(--text-faint)]">
          Demo mode — click Sign In to continue
        </p>
      </div>
    </div>
  )
}
