import os
import tempfile
os.environ['DATABASE_PATH'] = tempfile.mktemp(suffix='.sqlite3')
from app import create_app

app = create_app()
client = app.test_client()
assert client.get('/api/health').status_code == 200
assert client.post('/api/journeys/quote', json={'origin':'Aluva','destination':'Vyttila','journey_type':'orbit'}).get_json()['fare'] == 78
booking = client.post('/api/bookings', json={'passenger_name':'Test Rider','origin':'Aluva','destination':'Vyttila','journey_type':'orbit','pickup_zone':'South gate · Zone B'})
assert booking.status_code == 201
assert client.get('/api/clusters').status_code == 200
print('API tests passed')
