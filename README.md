# KMRL Orbit

KMRL Orbit is an AI-assisted last-mile journey layer for metro passengers. This repository contains independent passenger and driver React portals plus a Flask REST API.

## Applications

- `passenger-portal` — traveller booking experience
- `driver-portal` — driver operations experience
- `backend` — API, SQLite persistence, and clustering engine

## Live portals

- [Passenger Booking Portal](https://kochi-metro-booking-p9abxo2rx-abhinandnms-projects.vercel.app/) — live ticket and unified journey booking experience
- [Driver Portal](https://driverportal-rho.vercel.app/) — live driver cluster, trip, and earnings experience

## Local development

Install the frontend dependencies in each portal, then run `npm run dev`. For the API, create a Python virtual environment, install `backend/requirements.txt`, and run `flask --app app run --debug` from `backend`.

## Prototype sign-in

Use any username with password `123` in the Passenger Portal prototype.
