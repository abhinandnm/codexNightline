import { useMemo, useState } from 'react'
import {
  ArrowLeft, Bell, Bike, CalendarDays, ChevronDown, Clock3, CloudRain,
  CreditCard, Footprints, MapPin, Navigation, QrCode, ShieldCheck, Sparkles,
  Ticket, TrainFront, UsersRound, WalletCards,
} from 'lucide-react'

type JourneyKind = 'standard' | 'orbit'

const stations = ['Aluva', 'Edappally', 'Kaloor', 'MG Road', 'Maharaja’s College', 'Vyttila', 'Pettta']
const pickupZones = ['South gate · Zone B', 'North gate · Zone A', 'Metro feeder bay · Zone C']

export default function App() {
  const [journeyKind, setJourneyKind] = useState<JourneyKind>('orbit')
  const [from, setFrom] = useState('Aluva')
  const [to, setTo] = useState('Maharaja’s College')
  const [pickup, setPickup] = useState(pickupZones[0])
  const [confirmed, setConfirmed] = useState(false)

  const fares = useMemo(() => journeyKind === 'orbit'
    ? { amount: 78, label: 'Metro + shared last mile', saving: '₹24 less than a solo cab' }
    : { amount: 42, label: 'Metro ticket only', saving: 'Best value metro fare' }, [journeyKind])

  if (confirmed) {
    return <Confirmation from={from} to={to} pickup={pickup} fare={fares.amount} orbit={journeyKind === 'orbit'} onBack={() => setConfirmed(false)} />
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="topbar">
          <button className="icon-button" aria-label="Back"><ArrowLeft size={20} /></button>
          <div className="brand"><span className="brand-mark">O</span><span>ORBIT</span></div>
          <button className="icon-button notification" aria-label="Notifications"><Bell size={19} /><i /></button>
        </div>
        <div className="hero-copy">
          <p className="overline">GOOD EVENING, ABHIN</p>
          <h1>Where will the metro<br />take you today?</h1>
          <div className="weather-chip"><CloudRain size={16} /> 27°C · Light rain near Aluva</div>
        </div>
        <div className="route-card">
          <div className="route-line"><span className="origin-dot" /><span className="route-stem" /><span className="destination-dot" /></div>
          <label>FROM<select value={from} onChange={(event) => setFrom(event.target.value)}>{stations.map((station) => <option key={station}>{station}</option>)}</select></label>
          <label>TO<select value={to} onChange={(event) => setTo(event.target.value)}>{stations.map((station) => <option key={station}>{station}</option>)}</select></label>
          <button className="swap-button" aria-label="Swap stations">⇅</button>
        </div>
      </section>

      <section className="content-panel">
        <div className="section-heading"><div><p className="overline dark">CHOOSE YOUR JOURNEY</p><h2>Travel your way</h2></div><button className="date-button"><CalendarDays size={16} /> Today</button></div>
        <div className="journey-options">
          <JourneyOption selected={journeyKind === 'standard'} onClick={() => setJourneyKind('standard')} icon={<TrainFront />} title="Metro ticket" subtitle="Simple, direct, lowest fare" fare="₹42" />
          <JourneyOption selected={journeyKind === 'orbit'} onClick={() => setJourneyKind('orbit')} icon={<Sparkles />} title="Orbit unified journey" subtitle="Metro + a shared ride to your door" fare="₹78" recommended />
        </div>

        {journeyKind === 'orbit' && <section className="orbit-details">
          <div className="orbit-heading"><div className="sparkle-orb"><Sparkles size={18} /></div><div><strong>Smarter together</strong><p>AI is matching your last-mile ride</p></div><span className="match-chip"><UsersRound size={14} /> 3 nearby</span></div>
          <div className="timeline">
            <TimelineRow icon={<TrainFront size={17} />} title="Board at Aluva" meta="Green line · 18 min" />
            <TimelineRow icon={<Footprints size={17} />} title="Meet at pickup zone" meta="South gate · 3 min walk" />
            <div className="pickup-select"><MapPin size={17} /><select value={pickup} onChange={(event) => setPickup(event.target.value)}>{pickupZones.map((zone) => <option key={zone}>{zone}</option>)}</select><ChevronDown size={16} /></div>
            <TimelineRow icon={<Bike size={17} />} title="Share the last mile" meta="Weather-aware route · 12 min" last />
          </div>
        </section>}

        <section className="fare-card">
          <div><p className="fare-label">{fares.label}</p><p className="fare-saving"><ShieldCheck size={14} /> {fares.saving}</p></div>
          <strong>₹{fares.amount}</strong>
        </section>
        <button className="primary-button" onClick={() => setConfirmed(true)}>{journeyKind === 'orbit' ? 'Book unified journey' : 'Continue with metro'} <span>→</span></button>
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

function Confirmation({ from, to, pickup, fare, orbit, onBack }: { from: string; to: string; pickup: string; fare: number; orbit: boolean; onBack: () => void }) {
  return <main className="app-shell confirmation-page"><section className="confirm-hero"><div className="topbar"><button className="icon-button light" onClick={onBack} aria-label="Back"><ArrowLeft size={20} /></button><div className="brand light-brand"><span className="brand-mark">O</span><span>ORBIT</span></div><span /></div><div className="success-ring"><Ticket size={31} /></div><p className="overline">YOUR JOURNEY IS RESERVED</p><h1>See you at the station.</h1><p className="confirm-subtitle">Your QR ticket and {orbit ? 'shared ride' : 'metro trip'} are ready.</p></section><section className="ticket-sheet"><div className="ticket-route"><div><small>FROM</small><strong>{from}</strong></div><Navigation size={20} /><div className="right"><small>TO</small><strong>{to}</strong></div></div><div className="ticket-meta"><span><Clock3 size={16} /> Depart in 14 min</span><span><CreditCard size={16} /> ₹{fare} paid</span></div>{orbit && <div className="driver-card"><div className="driver-avatar">RK</div><div><small>YOUR ORBIT DRIVER</small><strong>Rakesh Kumar · KL 07 CD 4531</strong><p><MapPin size={14} /> {pickup}</p></div><button className="icon-button"><Navigation size={18} /></button></div>}<div className="qr-box"><QrCode size={78} /><div><strong>Show at the gate</strong><p>Valid for one passenger · Today</p></div></div><button className="primary-button" onClick={onBack}>View journey live <span>→</span></button></section></main>
}
