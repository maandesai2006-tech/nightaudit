'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Upload, Settings, Menu, X } from 'lucide-react'

interface NavBarProps {
  user: { name: string; role: string; email: string }
}

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload', label: 'Upload', icon: Upload },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function NavBar({ user }: NavBarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-[var(--bg)]" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div className="max-w-6xl mx-auto flex items-center h-14 px-4 md:px-6 gap-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 mr-6 select-none no-underline">
          <div className="dot-live animate-pulse-soft" />
          <span className="font-mono text-[0.7rem] font-bold tracking-[0.08em] text-[var(--text)] uppercase">
            NightAudit
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-wider transition-all duration-150 no-underline rounded-lg ${
                  isActive
                    ? 'text-[var(--accent)] bg-[var(--bg)] shadow-[var(--shadow-pressed)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                <Icon size={14} strokeWidth={isActive ? 2 : 1.5} />
                {label}
              </Link>
            )
          })}
        </div>

        {/* Right: User */}
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-[var(--text)]">{user.name}</p>
            <span className={`badge badge-${user.role}`}>{user.role}</span>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden btn btn-ghost btn-sm"
        >
          {mobileOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden max-w-6xl mx-auto px-4 pb-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider no-underline transition-all ${
                  isActive
                    ? 'shadow-[var(--shadow-pressed)] text-[var(--accent)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
