import { useMemo, useState } from 'react'
import {
  ArrowLeft, Bell, Bike, CalendarDays, ChevronDown, Clock3, CloudRain,
  CreditCard, Footprints, MapPin, Navigation, QrCode, ShieldCheck, Sparkles,
  Ticket, TrainFront, UsersRound, WalletCards,
} from 'lucide-react'

type JourneyKind = 'standard' | 'orbit'

const stations = ['Aluva', 'Edappally', 'Kaloor', 'MG Road', 'Maharaja’s College', 'Vyttila', 'Pettta']
const pickupZones = ['South gate · Zone B', 'North gate · Zone A', 'Metro feeder bay · Zone C']
const metroStations = ['Aluva Metro Station', 'Edappally Metro Station', 'Kaloor Metro Station', 'MG Road Metro Station', 'Maharaja’s College Metro Station', 'Vyttila Metro Station', 'Pettta Metro Station']
const finalDestinations = ['Aluva Bus Stand', 'Aluva Mahadeva Temple', 'UC College, Aluva', 'Lulu Mall, Edappally', 'Infopark, Kakkanad', 'Marine Drive, Kochi', 'Fort Kochi', 'Tripunithura']
const drivers = [{ initials: 'RK', name: 'Rakesh Kumar', vehicle: 'KL 07 CD 4531' }, { initials: 'AN', name: 'Anjali Nair', vehicle: 'KL 41 M 7812' }, { initials: 'SP', name: 'Sreejith Paul', vehicle: 'KL 39 J 2046' }]

export default function App() {
  const [journeyKind, setJourneyKind] = useState<JourneyKind>('orbit')
  const [from, setFrom] = useState('Aluva Metro')
  const [to, setTo] = useState('Infopark, Kakkanad')
  const [pickup, setPickup] = useState(pickupZones[0])
  const [confirmed, setConfirmed] = useState(false)
  const [matching, setMatching] = useState(false)
  const [boarding, setBoarding] = useState(false)
  const [tripStarted, setTripStarted] = useState(false)
  const [driver, setDriver] = useState(drivers[0])
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [signedIn, setSignedIn] = useState(false)
  const [loginError, setLoginError] = useState('')

  const fares = useMemo(() => journeyKind === 'orbit'
    ? { amount: 78, label: 'Metro + shared last mile', saving: '₹24 less than a solo cab' }
    : { amount: 42, label: 'Metro ticket only', saving: 'Best value metro fare' }, [journeyKind])

  if (!signedIn) return <main className="app-shell matching"><div className="matching-orb"><TrainFront size={28}/></div><p className="overline dark">KOCHI METRO</p><h1>Welcome aboard.</h1><p>Sign in to begin your unified journey.</p><input className="login-input" value={userName} onChange={(event) => setUserName(event.target.value)} placeholder="Username" /><input className="login-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" /><button className="primary-button" onClick={() => { if (userName.trim() && password === '123') { setSignedIn(true); setLoginError('') } else setLoginError('Invalid username or password.') }}>Continue <span>→</span></button>{loginError && <small className="login-error">{loginError}</small>}</main>

  if (confirmed) {
    return <Confirmation from={from} to={to} pickup={pickup} driver={driver} fare={fares.amount} orbit={journeyKind === 'orbit'} onBack={() => setConfirmed(false)} />
  }

  const submitBooking = async () => {
    setMatching(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8002/api'}/bookings`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({passenger_name:userName.trim(), origin:from, destination:to, journey_type:journeyKind}) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Booking failed')
      if (result.booking.pickup_zone) setPickup(result.booking.pickup_zone)
      setDriver(drivers[Math.floor(Math.random() * drivers.length)])
      await new Promise((resolve) => setTimeout(resolve, 10000))
      setMatching(false)
      setBoarding(true)
    } finally { setMatching(false) }
  }
  const confirmBoarding = async () => { setBoarding(false); setTripStarted(true); await new Promise((resolve) => setTimeout(resolve, 5000)); setTripStarted(false); setConfirmed(true) }
  const rebook = () => { setBoarding(false); setMatching(false); setTripStarted(false); setPickup(pickupZones[0]) }
  if (matching) return <main className="app-shell matching"><div className="matching-orb"><Sparkles size={28}/></div><p className="overline dark">UNIFIED BOOKING</p><h1>Preparing your unified journey…</h1><p>We are reserving your metro ticket and last-mile ride.</p><div className="matching-bar"><i /></div><small>This takes about 10 seconds</small></main>
  if (boarding) return <main className="app-shell matching"><div className="matching-orb"><MapPin size={28}/></div><p className="overline dark">NEXT STEP</p><h1>Head over to {from}.</h1><p>Have you boarded the metro at {from}?</p><button className="primary-button" onClick={() => void confirmBoarding()}>Yes, I have boarded <span>→</span></button><button className="rebook-button" onClick={rebook}>Rebook journey</button></main>
  if (tripStarted) return <main className="app-shell matching"><div className="matching-orb"><TrainFront size={28}/></div><p className="overline dark">UNIFIED BOOKING</p><h1>Your metro journey has started.</h1><p>We will reveal your pickup zone when you arrive at the nearest station.</p><div className="matching-bar"><i /></div><small>Travelling towards your handoff station</small></main>
  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="topbar">
          <button className="icon-button" aria-label="Back"><ArrowLeft size={20} /></button>
          <div className="brand"><span className="brand-mark">K</span><span>KOCHI METRO</span></div>
          <button className="icon-button notification" aria-label="Notifications"><Bell size={19} /><i /></button>
        </div>
        <div className="hero-copy">
          <p className="overline">GOOD EVENING, ABHIN</p>
          <h1>Where will the metro<br />take you today?</h1>
          <div className="weather-chip"><CloudRain size={16} /> 27°C · Light rain near Aluva</div>
        </div>
        <div className="route-card">
          <div className="route-line"><span className="origin-dot" /><span className="route-stem" /><span className="destination-dot" /></div>
          <label>START METRO STATION<input list="metro-stations" value={from} onChange={(event) => setFrom(event.target.value)} placeholder="Choose your station" /></label>
          <label>FINAL DESTINATION<input list="final-destinations" value={to} onChange={(event) => setTo(event.target.value)} placeholder="Where are you going?" /></label>
          <button className="swap-button" aria-label="Swap stations">⇅</button>
          <datalist id="metro-stations">{metroStations.map((location) => <option key={location} value={location} />)}</datalist><datalist id="final-destinations">{finalDestinations.map((location) => <option key={location} value={location} />)}</datalist>
        </div>
      </section>

      <section className="content-panel">
        <div className="section-heading"><div><p className="overline dark">CHOOSE YOUR JOURNEY</p><h2>Travel your way</h2></div><button className="date-button"><CalendarDays size={16} /> Today</button></div>
        <div className="journey-options">
          <JourneyOption selected={journeyKind === 'standard'} onClick={() => setJourneyKind('standard')} icon={<TrainFront />} title="Metro ticket" subtitle="Simple, direct, lowest fare" fare="₹42" />
          <JourneyOption selected={journeyKind === 'orbit'} onClick={() => setJourneyKind('orbit')} icon={<Sparkles />} title="Unified Booking" subtitle="Metro + a shared ride to your door" fare="₹78" recommended />
        </div>

        {journeyKind === 'orbit' && <section className="orbit-details">
          <div className="orbit-heading"><div className="sparkle-orb"><Sparkles size={18} /></div><div><strong>One ticket, one journey</strong><p>Metro and shared last-mile travel in one booking</p></div><span className="match-chip"><UsersRound size={14} /> 3 nearby</span></div>
          <div className="timeline">
            <TimelineRow icon={<TrainFront size={17} />} title="Board at your metro station" meta="Your ticket covers the metro segment" />
            <TimelineRow icon={<Footprints size={17} />} title="Arrive at the nearest metro station" meta="Zone guidance appears only after arrival" />
            <TimelineRow icon={<Bike size={17} />} title="Share the last mile" meta="Weather-aware route · 12 min" last />
          </div>
        </section>}

        <section className="fare-card">
          <div><p className="fare-label">{fares.label}</p><p className="fare-saving"><ShieldCheck size={14} /> {fares.saving}</p></div>
          <strong>₹{fares.amount}</strong>
        </section>
        <button className="primary-button" onClick={submitBooking}>{journeyKind === 'orbit' ? 'Book unified journey' : 'Continue with metro'} <span>→</span></button>
        <div className="bottom-note"><WalletCards size={16} /> Payment stays together in one secure checkout</div>
      </section>
    </main>
  )
}

function JourneyOption({ selected, onClick, icon, title, subtitle, fare, recommended = false }: { selected: boolean; onClick: () => void; icon: React.ReactNode; title: string; subtitle: string; fare: string; recommended?: boolean }) {
  return <button onClick={onClick} className={`journey-option ${selected ? 'selected' : ''}`}>
    {recommended && <span className="recommended">RECOMMENDED</span>}<span className="journey-icon">{icon}</span><span className="journey-text"><strong>{title}</strong><small>{subtitle}</small></span><span className="journey-fare">{fare}<i /></span>
  </button>
}

function TimelineRow({ icon, title, meta, last = false }: { icon: React.ReactNode; title: string; meta: string; last?: boolean }) {
  return <div className="timeline-row"><div className="timeline-icon">{icon}{!last && <span />}</div><div><strong>{title}</strong><p>{meta}</p></div></div>
}

function Confirmation({ from, to, pickup, driver, fare, orbit, onBack }: { from: string; to: string; pickup: string; driver: typeof drivers[number]; fare: number; orbit: boolean; onBack: () => void }) {
  return <main className="app-shell confirmation-page"><section className="confirm-hero"><div className="topbar"><button className="icon-button light" onClick={onBack} aria-label="Back"><ArrowLeft size={20} /></button><div className="brand light-brand"><span className="brand-mark">K</span><span>KOCHI METRO</span></div><span /></div><div className="success-ring"><MapPin size={31} /></div><p className="overline">YOUR PICKUP ZONE IS READY</p><h1>Go to your assigned zone.</h1><p className="confirm-subtitle">Walk to the zone below and wait for your shared cab towards {to}.</p></section><section className="ticket-sheet"><div className="ticket-route"><div><small>FROM</small><strong>{from}</strong></div><Navigation size={20} /><div className="right"><small>TO</small><strong>{to}</strong></div></div><div className="ticket-meta"><span><Clock3 size={16} /> Depart in 14 min</span><span><CreditCard size={16} /> ₹{fare} paid</span></div>{orbit && <div className="driver-card"><div className="driver-avatar">{driver.initials}</div><div><small>DRIVER WAITING AT YOUR ZONE</small><strong>{driver.name} · {driver.vehicle}</strong><p><MapPin size={14} /> {pickup}</p></div><button className="icon-button"><Navigation size={18} /></button></div>}<div className="qr-box"><QrCode size={78} /><div><strong>Show at the metro gate</strong><p>Then follow the zone guidance in this app.</p></div></div><button className="primary-button" onClick={onBack}>I’m heading to the zone <span>→</span></button><button className="rebook-button" onClick={() => window.alert('Kochi Metro support has been notified. A travel assistant will contact you shortly.')}>Trouble finding your travel buddy? Get help</button></section></main>
}
