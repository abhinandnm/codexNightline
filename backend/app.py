import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from database import connect, initialize
from clustering import create_clusters

load_dotenv()
STATIONS = ['Aluva', 'Edappally', 'Kaloor', 'MG Road', 'Maharaja’s College', 'Vyttila', 'Pettta']
DESTINATION_ZONES = {'Aluva': 'North gate · Zone A', 'Edappally': 'Metro feeder bay · Zone C', 'Kaloor': 'South gate · Zone B', 'MG Road': 'South gate · Zone B', 'Maharaja’s College': 'South gate · Zone B', 'Vyttila': 'Metro feeder bay · Zone C', 'Pettta': 'North gate · Zone A'}

def row(data): return dict(data) if data else None

def create_app():
    app = Flask(__name__)
    origins = [item for item in (os.getenv('PASSENGER_ORIGIN'), os.getenv('DRIVER_ORIGIN')) if item] or '*'
    CORS(app, resources={r'/api/*': {'origins': origins}})
    initialize()

    @app.get('/')
    def index():
        return jsonify(service='kmrl-orbit-api', status='ok', health='/api/health', documentation={'stations':'/api/stations', 'clusters':'/api/clusters', 'admin':'/api/admin/overview'})

    @app.get('/api/health')
    def health(): return jsonify(status='ok', service='kmrl-orbit-api', database='ready')

    @app.get('/api/stations')
    def stations(): return jsonify(stations=STATIONS)

    @app.post('/api/journeys/quote')
    def quote():
        data = request.get_json(silent=True) or {}
        if data.get('origin') not in STATIONS or data.get('destination') not in STATIONS: return jsonify(error='Select valid metro stations.'), 400
        orbit = data.get('journey_type') == 'orbit'
        return jsonify(origin=data['origin'], destination=data['destination'], journey_type='orbit' if orbit else 'standard', fare=78 if orbit else 42, estimated_minutes=35 if orbit else 23, pickup_zone=DESTINATION_ZONES[data['destination']] if orbit else None)

    @app.post('/api/bookings')
    def book():
        data = request.get_json(silent=True) or {}
        required = ('passenger_name', 'origin', 'destination', 'journey_type')
        if any(not data.get(key) for key in required): return jsonify(error='Missing booking details.'), 400
        if data['origin'] not in STATIONS or data['destination'] not in STATIONS or data['origin'] == data['destination']: return jsonify(error='Invalid journey route.'), 400
        orbit = data['journey_type'] == 'orbit'
        pickup_zone = DESTINATION_ZONES[data['destination']] if orbit else None
        with connect() as db:
            cursor = db.execute('INSERT INTO bookings(passenger_name,origin,destination,journey_type,pickup_zone,fare) VALUES(?,?,?,?,?,?)', (data['passenger_name'],data['origin'],data['destination'],'orbit' if orbit else 'standard',pickup_zone,78 if orbit else 42))
            booking = row(db.execute('SELECT * FROM bookings WHERE id=?', (cursor.lastrowid,)).fetchone())
        return jsonify(booking=booking), 201

    @app.get('/api/clusters')
    def clusters():
        with connect() as db:
            records = [row(item) for item in db.execute('SELECT c.*, d.name AS driver_name FROM clusters c LEFT JOIN drivers d ON c.driver_id=d.id WHERE c.status IN ("open","accepted") ORDER BY c.id DESC')]
        return jsonify(clusters=records)

    @app.post('/api/clusters/<int:cluster_id>/accept')
    def accept(cluster_id):
        data = request.get_json(silent=True) or {}
        driver_id = data.get('driver_id')
        with connect() as db:
            driver = db.execute('SELECT * FROM drivers WHERE id=? AND online=1', (driver_id,)).fetchone()
            cluster = db.execute('SELECT * FROM clusters WHERE id=? AND status="open"', (cluster_id,)).fetchone()
            if not driver or not cluster: return jsonify(error='Cluster unavailable or driver offline.'), 409
            db.execute('UPDATE clusters SET status="accepted", driver_id=? WHERE id=?', (driver_id,cluster_id))
            return jsonify(cluster=row(db.execute('SELECT * FROM clusters WHERE id=?',(cluster_id,)).fetchone()))

    @app.patch('/api/drivers/<int:driver_id>/availability')
    def availability(driver_id):
        online = bool((request.get_json(silent=True) or {}).get('online'))
        with connect() as db:
            if not db.execute('SELECT 1 FROM drivers WHERE id=?',(driver_id,)).fetchone(): return jsonify(error='Driver not found.'),404
            db.execute('UPDATE drivers SET online=? WHERE id=?',(online,driver_id))
            return jsonify(driver=row(db.execute('SELECT * FROM drivers WHERE id=?',(driver_id,)).fetchone()))

    @app.get('/api/admin/overview')
    def overview():
        with connect() as db:
            return jsonify(bookings=db.execute('SELECT COUNT(*) FROM bookings').fetchone()[0], open_clusters=db.execute('SELECT COUNT(*) FROM clusters WHERE status="open"').fetchone()[0], online_drivers=db.execute('SELECT COUNT(*) FROM drivers WHERE online=1').fetchone()[0])
    return app

app = create_app()
if __name__ == '__main__': app.run(host='0.0.0.0', port=int(os.getenv('PORT', '8000')), debug=os.getenv('FLASK_ENV') == 'development')
