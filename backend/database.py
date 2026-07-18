import os
import sqlite3
from pathlib import Path

DATABASE_PATH = Path(os.getenv('DATABASE_PATH', Path(__file__).parent / 'instance' / 'orbit.sqlite3'))

def connect():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DATABASE_PATH)
    db.row_factory = sqlite3.Row
    return db

def initialize():
    with connect() as db:
        db.executescript('''
        CREATE TABLE IF NOT EXISTS drivers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, vehicle TEXT NOT NULL, online INTEGER NOT NULL DEFAULT 0, wallet REAL NOT NULL DEFAULT 0, latitude REAL, longitude REAL);
        CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY, passenger_name TEXT NOT NULL, origin TEXT NOT NULL, destination TEXT NOT NULL, journey_type TEXT NOT NULL CHECK(journey_type IN ('standard','orbit')), pickup_zone TEXT, fare REAL NOT NULL, status TEXT NOT NULL DEFAULT 'confirmed', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS clusters (id INTEGER PRIMARY KEY, origin TEXT NOT NULL, destination TEXT NOT NULL, pickup_zone TEXT NOT NULL, passenger_count INTEGER NOT NULL, estimated_minutes INTEGER NOT NULL, fare REAL NOT NULL, status TEXT NOT NULL DEFAULT 'open', driver_id INTEGER, FOREIGN KEY(driver_id) REFERENCES drivers(id));
        ''')
        if not db.execute('SELECT 1 FROM drivers LIMIT 1').fetchone():
            db.executemany('INSERT INTO drivers(name,vehicle,online,wallet,latitude,longitude) VALUES(?,?,?,?,?,?)', [('Rakesh Kumar','KL 07 CD 4531',1,840,10.109,76.352),('Maya S','KL 42 A 989',1,560,10.029,76.312)])
        if not db.execute('SELECT 1 FROM clusters LIMIT 1').fetchone():
            db.execute('INSERT INTO clusters(origin,destination,pickup_zone,passenger_count,estimated_minutes,fare) VALUES(?,?,?,?,?,?)', ('Aluva','Kakkanad','South gate · Zone B',3,24,132))
