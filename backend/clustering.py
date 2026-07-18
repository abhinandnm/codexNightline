from collections import defaultdict

def create_clusters(bookings):
    """Groups unassigned Orbit bookings by station pair and creates max-four rider clusters."""
    groups = defaultdict(list)
    for booking in bookings:
        groups[(booking['origin'], booking['destination'], booking['pickup_zone'])].append(booking)
    clusters = []
    for (origin, destination, pickup_zone), riders in groups.items():
        for offset in range(0, len(riders), 4):
            group = riders[offset:offset + 4]
            clusters.append({'origin': origin, 'destination': destination, 'pickup_zone': pickup_zone, 'passenger_count': len(group), 'estimated_minutes': 12 + len(group) * 4, 'fare': 84 + len(group) * 16})
    return clusters
