import HotelDetailClient from './HotelDetailClient'

export default async function HotelDetailPage({ params }: { params: Promise<{ hotelId: string }> }) {
  const { hotelId } = await params
  return <HotelDetailClient hotelId={hotelId} />
}
