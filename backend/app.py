import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from database import connect, initialize

load_dotenv()
STATIONS = ['Aluva', 'Edappally', 'Kaloor', 'MG Road', 'Maharaja’s College', 'Vyttila', 'Pettta']
DESTINATION_ZONES = {'Aluva': 'North gate · Zone A', 'Edappally': 'Metro feeder bay · Zone C', 'Kaloor': 'South gate · Zone B', 'MG Road': 'South gate · Zone B', 'Maharaja’s College': 'South gate · Zone B', 'Vyttila': 'Metro feeder bay · Zone C', 'Pettta': 'North gate · Zone A'}

def row(data): return dict(data) if data else None

def nearest_station(final_destination):
    mapping = {'kakkanad': 'Vyttila', 'infopark': 'Vyttila', 'fort kochi': 'MG Road', 'marine drive': 'MG Road', 'edappally': 'Edappally', 'aluva': 'Aluva', 'tripunithura': 'Pettta'}
    return next((station for key, station in mapping.items() if key in final_destination.lower()), 'Maharaja’s College')

def cluster_payload(db, cluster):
    payload = row(cluster)
    payload['passengers'] = [row(item) for item in db.execute('SELECT id, passenger_name, destination, status FROM bookings WHERE cluster_id=? ORDER BY id', (cluster['id'],))]
    return payload

def get_or_create_driver(db, name):
    driver = db.execute('SELECT * FROM drivers WHERE lower(name)=lower(?)', (name,)).fetchone()
    if driver:
        db.execute('UPDATE drivers SET online=1 WHERE id=?', (driver['id'],))
        return db.execute('SELECT * FROM drivers WHERE id=?', (driver['id'],)).fetchone()
    cursor = db.execute('INSERT INTO drivers(name,vehicle,online,wallet) VALUES(?,?,?,?)', (name, 'Kochi Metro feeder', 1, 0))
    return db.execute('SELECT * FROM drivers WHERE id=?', (cursor.lastrowid,)).fetchone()

def create_app():
    app = Flask(__name__)
    origins = [item for item in (os.getenv('PASSENGER_ORIGIN'), os.getenv('DRIVER_ORIGIN')) if item] or '*'
    CORS(app, resources={r'/api/*': {'origins': origins}})
    initialize()

    @app.get('/')
    def index(): return jsonify(service='kmrl-unified-ticketing-api', status='ok', health='/api/health')

    @app.get('/api/health')
    def health(): return jsonify(status='ok', service='kmrl-unified-ticketing-api', database='ready')

    @app.get('/api/stations')
    def stations(): return jsonify(stations=STATIONS)

    @app.post('/api/journeys/quote')
    def quote():
        data = request.get_json(silent=True) or {}
        if data.get('origin') not in STATIONS or data.get('destination') not in STATIONS:
            return jsonify(error='Select valid metro stations.'), 400
        orbit = data.get('journey_type') == 'orbit'
        return jsonify(origin=data['origin'], destination=data['destination'], journey_type='orbit' if orbit else 'standard', fare=78 if orbit else 42, estimated_minutes=35 if orbit else 23, pickup_zone=DESTINATION_ZONES[data['destination']] if orbit else None)

    @app.post('/api/bookings')
    def book():
        data = request.get_json(silent=True) or {}
        required = ('passenger_name', 'origin', 'destination', 'journey_type')
        if any(not str(data.get(key, '')).strip() for key in required): return jsonify(error='Missing booking details.'), 400
        orbit = data['journey_type'] == 'orbit'
        station = nearest_station(data['destination'])
        pickup_zone = DESTINATION_ZONES[station] if orbit else None
        with connect() as db:
            cursor = db.execute('INSERT INTO bookings(passenger_name,origin,destination,nearest_station,journey_type,pickup_zone,fare,status) VALUES(?,?,?,?,?,?,?,?)', (data['passenger_name'].strip(), data['origin'].strip(), data['destination'].strip(), station, 'orbit' if orbit else 'standard', pickup_zone, 78 if orbit else 42, 'confirmed'))
            booking_id = cursor.lastrowid
            if orbit:
                cluster = db.execute('SELECT * FROM clusters WHERE origin=? AND destination=? AND pickup_zone=? AND status="open" ORDER BY id DESC LIMIT 1', (data['origin'].strip(), station, pickup_zone)).fetchone()
                if not cluster:
                    cluster_cursor = db.execute('INSERT INTO clusters(origin,destination,pickup_zone,passenger_count,estimated_minutes,fare) VALUES(?,?,?,?,?,?)', (data['origin'].strip(), station, pickup_zone, 0, 24, 132))
                    cluster = db.execute('SELECT * FROM clusters WHERE id=?', (cluster_cursor.lastrowid,)).fetchone()
                db.execute('UPDATE bookings SET cluster_id=?, status="clustered" WHERE id=?', (cluster['id'], booking_id))
                db.execute('UPDATE clusters SET passenger_count=(SELECT COUNT(*) FROM bookings WHERE cluster_id=?) WHERE id=?', (cluster['id'], cluster['id']))
            booking = row(db.execute('SELECT * FROM bookings WHERE id=?', (booking_id,)).fetchone())
        return jsonify(booking=booking), 201

    @app.get('/api/bookings/<int:booking_id>')
    def booking_status(booking_id):
        with connect() as db:
            booking = db.execute('SELECT b.*, c.status AS cluster_status, c.pickup_zone AS assigned_zone, d.name AS driver_name, d.vehicle AS driver_vehicle FROM bookings b LEFT JOIN clusters c ON b.cluster_id=c.id LEFT JOIN drivers d ON c.driver_id=d.id WHERE b.id=?', (booking_id,)).fetchone()
            if not booking: return jsonify(error='Booking not found.'), 404
            return jsonify(booking=row(booking))

    @app.get('/api/clusters')
    def clusters():
        with connect() as db:
            records = [cluster_payload(db, item) for item in db.execute('SELECT c.*, d.name AS driver_name, d.vehicle AS driver_vehicle FROM clusters c LEFT JOIN drivers d ON c.driver_id=d.id WHERE c.status IN ("open","accepted") ORDER BY c.id DESC')]
        return jsonify(clusters=records)

    @app.post('/api/clusters/<int:cluster_id>/accept')
    def accept(cluster_id):
        name = str((request.get_json(silent=True) or {}).get('driver_name', '')).strip()
        if not name: return jsonify(error='Driver name is required.'), 400
        with connect() as db:
            cluster = db.execute('SELECT * FROM clusters WHERE id=? AND status="open"', (cluster_id,)).fetchone()
            if not cluster: return jsonify(error='Cluster is no longer available.'), 409
            driver = get_or_create_driver(db, name)
            db.execute('UPDATE clusters SET status="accepted", driver_id=? WHERE id=?', (driver['id'], cluster_id))
            db.execute('UPDATE bookings SET status="driver_assigned" WHERE cluster_id=?', (cluster_id,))
            accepted = db.execute('SELECT c.*, d.name AS driver_name, d.vehicle AS driver_vehicle FROM clusters c JOIN drivers d ON c.driver_id=d.id WHERE c.id=?', (cluster_id,)).fetchone()
            return jsonify(cluster=cluster_payload(db, accepted))

    @app.post('/api/clusters/<int:cluster_id>/complete')
    def complete(cluster_id):
        with connect() as db:
            cluster = db.execute('SELECT * FROM clusters WHERE id=? AND status="accepted"', (cluster_id,)).fetchone()
            if not cluster: return jsonify(error='Accepted cluster not found.'), 409
            db.execute('UPDATE clusters SET status="completed" WHERE id=?', (cluster_id,))
            db.execute('UPDATE bookings SET status="completed" WHERE cluster_id=?', (cluster_id,))
            db.execute('UPDATE drivers SET wallet=wallet+? WHERE id=?', (cluster['fare'], cluster['driver_id']))
            return jsonify(completed=True, earnings=cluster['fare'])

    @app.get('/api/admin/overview')
    def overview():
        with connect() as db:
            return jsonify(bookings=db.execute('SELECT COUNT(*) FROM bookings').fetchone()[0], open_clusters=db.execute('SELECT COUNT(*) FROM clusters WHERE status="open"').fetchone()[0], online_drivers=db.execute('SELECT COUNT(*) FROM drivers WHERE online=1').fetchone()[0])
    return app

app = create_app()
if __name__ == '__main__': app.run(host='0.0.0.0', port=int(os.getenv('PORT', '8000')), debug=os.getenv('FLASK_ENV') == 'development')
