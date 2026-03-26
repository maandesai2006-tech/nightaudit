import { HOTELS } from '@/lib/mock/data'
import HotelDetailClient from './HotelDetailClient'

export function generateStaticParams() {
  return HOTELS.map(h => ({ hotelId: h.id }))
}

export default async function HotelDetailPage({ params }: { params: Promise<{ hotelId: string }> }) {
  const { hotelId } = await params
  return <HotelDetailClient hotelId={hotelId} />
}
