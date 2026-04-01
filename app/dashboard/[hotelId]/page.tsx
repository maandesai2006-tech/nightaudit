import HotelDetailClient from './HotelDetailClient'

// Generate static params for the 5 hotels
export function generateStaticParams() {
  return ['h1', 'h2', 'h3', 'h4', 'h5'].map(id => ({ hotelId: id }))
}

export default async function HotelDetailPage({ params }: { params: Promise<{ hotelId: string }> }) {
  const { hotelId } = await params
  return <HotelDetailClient hotelId={hotelId} />
}
