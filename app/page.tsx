'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  useEffect(() => { router.replace('/dashboard') }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-3 h-3 rounded-full led-green animate-pulse mx-auto mb-3" />
        <p className="font-mono text-xs text-[#4a5568] uppercase tracking-wider">Loading...</p>
      </div>
    </div>
  )
}
