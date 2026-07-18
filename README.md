# KMRL Orbit

KMRL Orbit is an AI-assisted last-mile journey layer for metro passengers. This repository contains independent passenger and driver React portals plus a Flask REST API.

## Applications

- `passenger-portal` — traveller booking experience
- `driver-portal` — driver operations experience
- `backend` — API, SQLite persistence, and clustering engine

## Live portals

- [Passenger Booking Portal](https://kochi-metro-booking-p9abxo2rx-abhinandnms-projects.vercel.app/) — live ticket and unified journey booking experience
- [Driver Portal](https://driverportal-rho.vercel.app/) — live driver cluster, trip, and earnings experience

## Features

### Passenger Booking Portal

- Prototype sign-in with any username and password `123`
- Station-only start selection and typed final-destination search suggestions
- Standard metro ticket and recommended Unified Booking choices
- Unified metro, shared last-mile, and single-payment journey summary
- AI destination grouping with a nearest-station and pickup-zone assignment
- Guided rider flow: booking, station boarding confirmation, metro journey, arrival-zone handoff, cab/feeder confirmation, and final-destination completion
- Random demo driver assignment and in-app travel-partner help action

### Driver Portal

- Online/offline availability controls
- Nearby grouped-passenger cluster card with route, rider count, fare, and ETA
- Accept, start, and complete trip workflow
- Earnings, wallet, navigation, and trip-history entry points

### Backend API and AI grouping

- Flask REST API with Flask-CORS and SQLite storage designed for a future PostgreSQL replacement
- Passenger booking, station lookup, journey quotes, driver availability, cluster acceptance, and admin overview endpoints
- Destination-aware nearest-station mapping and pickup-zone assignment for grouped last-mile riders
- Gunicorn, Nginx, and systemd production configuration for Ubuntu EC2

## Deployment

- Passenger and Driver applications are independently deployed to Vercel.
- Flask API is deployed on EC2 and served through Nginx.
- EC2 deployment and Vercel environment-variable instructions: [DEPLOYMENT.md](DEPLOYMENT.md)

## Local development

Install the frontend dependencies in each portal, then run `npm run dev`. For the API, create a Python virtual environment, install `backend/requirements.txt`, and run `flask --app app run --debug` from `backend`.

## Prototype sign-in

Use any username with password `123` in the Passenger Portal prototype.
