import { useState } from 'react'
import { Bike, CheckCircle2, ChevronRight, Clock3, MapPin, Navigation, Power, Route, TrainFront, Users, Wallet } from 'lucide-react'

type TripState = 'available' | 'accepted' | 'riding' | 'complete'
type PortalView = 'trips' | 'history' | 'wallet'
type TripRecord = { id: number; completedAt: string }

const tripFare = 132
const stationNavigationUrl = 'https://www.google.com/maps/dir/?api=1&destination=Aluva%20Metro%20Station'

export default function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [signedIn, setSignedIn] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [online, setOnline] = useState(true)
  const [trip, setTrip] = useState<TripState>('available')
  const [activeView, setActiveView] = useState<PortalView>('trips')
  const [earnings, setEarnings] = useState(0)
  const [tripHistory, setTripHistory] = useState<TripRecord[]>([])

  const initials = username.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'D'
  const action = trip === 'available' ? 'Accept cluster' : trip === 'accepted' ? 'Start pickup' : 'Complete trip'

  const openNavigation = () => {
    const mapWindow = window.open(stationNavigationUrl, '_blank', 'noopener,noreferrer')
    if (!mapWindow) window.location.assign(stationNavigationUrl)
  }

  const advanceTrip = () => {
    if (trip === 'available') setTrip('accepted')
    else if (trip === 'accepted') setTrip('riding')
    else if (trip === 'riding') {
      setEarnings((current) => current + tripFare)
      setTripHistory((current) => [{ id: Date.now(), completedAt: new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(new Date()) }, ...current])
      setTrip('complete')
    }
  }

  if (!signedIn) {
    return <main className="driver-shell driver-login"><div className="login-logo"><TrainFront size={27} /></div><small>KOCHI METRO DRIVER PORTAL</small><h1>Move the city forward.</h1><p>Sign in to receive nearby passenger clusters.</p><input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Username" /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" /><button className="primary" onClick={() => { if (username.trim() && password === '123') { setSignedIn(true); setLoginError('') } else setLoginError('Invalid username or password.') }}>Continue <ChevronRight size={20} /></button>{loginError && <small className="driver-error">{loginError}</small>}</main>
  }

  const tripsView = trip === 'complete'
    ? <section className="completed"><CheckCircle2 size={42} /><h2>Trip completed</h2><p>₹{tripFare} added to your wallet.</p><button className="primary" onClick={() => setTrip('available')}>Find next cluster <ChevronRight size={20} /></button></section>
    : <><div className="section-title"><div><small>KOCHI METRO CLUSTER</small><h2>{trip === 'available' ? 'A route that fits' : trip === 'accepted' ? 'Head to the station' : 'On the way together'}</h2></div><span className="cluster">3 <Users size={14} /></span></div><section className="cluster-card"><div className="cluster-top"><span className="trip-icon"><Bike size={20} /></span><div><strong>Aluva → Kakkanad</strong><p><Clock3 size={13} /> 24 min · 8.2 km</p></div><span className="price">₹{tripFare}</span></div><div className="route-steps"><p><i /> Aluva Metro · South gate</p><p><i /> Infopark Phase 1 · 3 drop-offs</p></div><div className="riders"><span>AN</span><span>SM</span><span>+1</span><p>3 riders are ready at the pickup zone</p></div></section><button disabled={!online} className="primary" onClick={advanceTrip}>{action}<ChevronRight size={20} /></button><button className="nav-button" onClick={openNavigation}><Route size={18} /> Open navigation to Aluva Metro</button></>

  const historyView = <><div className="section-title"><div><small>RIDE HISTORY</small><h2>Completed trips</h2></div></div>{tripHistory.length === 0 ? <section className="empty-state"><Clock3 size={32} /><strong>No completed rides yet</strong><p>Complete your first assigned cluster to see it here.</p></section> : tripHistory.map((record) => <section className="history-card" key={record.id}><span className="trip-icon"><CheckCircle2 size={20} /></span><div><strong>Aluva → Kakkanad</strong><p>Completed at {record.completedAt} · 3 riders</p></div><span className="price">+₹{tripFare}</span></section>)}</>

  const walletView = <><div className="section-title"><div><small>DRIVER WALLET</small><h2>Your earnings</h2></div></div><section className="wallet-card"><Wallet size={30} /><small>AVAILABLE BALANCE</small><strong>₹{earnings}</strong><p>{tripHistory.length === 0 ? 'Complete a ride to add earnings.' : `${tripHistory.length} completed ${tripHistory.length === 1 ? 'trip' : 'trips'} credited to your wallet.`}</p></section><section className="info-card"><strong>How earnings work</strong><p>Each completed cluster trip is credited to your wallet immediately for this prototype.</p></section></>

  return <main className="driver-shell"><header><div className="avatar">{initials}</div><div><small>GOOD EVENING</small><h1>{username}</h1></div><button className={`online ${online ? '' : 'off'}`} onClick={() => setOnline(!online)}><Power size={15} />{online ? 'Online' : 'Offline'}</button></header><section className="map"><div className="map-label"><Navigation size={16} /><span>Near Aluva Metro</span></div><span className="pin one" /><span className="pin two" /><span className="route-line" /><div className="map-status"><span className="pulse" /> {online ? 'Looking for nearby clusters' : 'You are offline'}</div></section><section className="content"><div className="earnings"><div><small>TODAY’S EARNINGS</small><strong>₹{earnings}</strong><p>{tripHistory.length === 0 ? 'Complete a ride to start earning' : `${tripHistory.length} completed ${tripHistory.length === 1 ? 'trip' : 'trips'} today`}</p></div><Wallet size={25} /></div>{activeView === 'trips' ? tripsView : activeView === 'history' ? historyView : walletView}</section><nav><button className={activeView === 'trips' ? 'active' : ''} onClick={() => setActiveView('trips')}><MapPin size={19} /><span>Trips</span></button><button className={activeView === 'history' ? 'active' : ''} onClick={() => setActiveView('history')}><Clock3 size={19} /><span>History</span></button><button className={activeView === 'wallet' ? 'active' : ''} onClick={() => setActiveView('wallet')}><Wallet size={19} /><span>Wallet</span></button></nav></main>
}
