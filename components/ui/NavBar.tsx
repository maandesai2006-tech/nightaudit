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
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/nightaudit'

  const resolveHref = (href: string) => `${basePath}${href}`

  return (
    <nav className="sticky top-0 z-50 bg-[#e0e5ec] shadow-card">
      <div className="flex items-center h-14 px-4 md:px-6 gap-4">
        {/* Logo + LED */}
        <Link href={resolveHref('/dashboard')} className="flex items-center gap-2 mr-4 select-none no-underline">
          <div className="w-2.5 h-2.5 rounded-full led-green animate-pulse" />
          <span className="font-mono text-xs font-bold tracking-[0.1em] text-[#2d3436] uppercase">NightAudit</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === resolveHref(href) || pathname.startsWith(resolveHref(href) + '/')
            return (
              <Link
                key={href}
                href={resolveHref(href)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 no-underline ${
                  isActive ? 'tab-active text-[#ff4757]' : 'tab-inactive text-[#4a5568]'
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            )
          })}
        </div>

        {/* Right: User + Role */}
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-[#2d3436]">{user.name}</p>
            <span className={`badge badge-${user.role}`}>{user.role}</span>
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden btn btn-ghost btn-sm"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-3 space-y-1 shadow-card">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === resolveHref(href) || pathname.startsWith(resolveHref(href) + '/')
            return (
              <Link
                key={href}
                href={resolveHref(href)}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider no-underline ${
                  isActive ? 'shadow-pressed text-[#ff4757]' : 'shadow-sm-neu text-[#4a5568]'
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
