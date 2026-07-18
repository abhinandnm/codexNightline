const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'
export async function bookJourney(payload: { passenger_name: string; origin: string; destination: string; journey_type: 'standard' | 'orbit'; pickup_zone?: string }) {
  const response = await fetch(`${API}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!response.ok) throw new Error((await response.json()).error || 'Booking failed')
  return response.json()
}
