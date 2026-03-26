'use client'

type Brand = 'ihg' | 'hilton' | 'choice' | 'marriott' | 'other'

const brandLabels: Record<Brand, string> = {
  ihg: 'IHG',
  hilton: 'Hilton',
  choice: 'Choice',
  marriott: 'Marriott',
  other: 'Other',
}

export default function BrandBadge({ brand }: { brand: Brand }) {
  return <span className={`badge badge-${brand}`}>{brandLabels[brand]}</span>
}
