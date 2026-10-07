# Ndova — Service & Appointment Booking System

Ndova is a full-stack service request and appointment booking platform. Clients can discover provider services, choose available time slots, and request appointments. Providers can create and manage their own service offerings, review appointment requests, and approve or reject bookings. Admins can manage clients, providers, and platform records.

## Core Features

- **Authentication & roles:** users register/login as Client, Provider, or Admin.
- **Service catalogue:** predefined service categories such as medical, legal, software, beauty, cleaning, and more.
- **Provider services:** providers create offerings with location, description, image URL, meeting link, rating, and duration.
- **Appointment booking:** clients select a provider service, date, and available time slot.
- **Availability handling:** booked slots are disabled; rejected appointments free the slot again.
- **Provider dashboard:** providers manage services and appointment requests.
- **Admin management:** admins view, edit, and delete clients/providers with related records cleaned up.
- **API documentation:** backend routes include Swagger documentation.

## Tech Stack

| Area            | Stack                                                            |
| --------------- | ---------------------------------------------------------------- |
| Frontend        | React, TypeScript, Vite, Ant Design, Redux Toolkit, React Router |
| Backend         | Node.js, Express.js, TypeScript                                  |
| Database        | PostgreSQL, Sequelize ORM, Sequelize migrations                  |
| Auth & Security | JWT, bcrypt, role-based access control                           |
| Tooling         | Docker, Docker Compose, Jest, Supertest, Swagger                 |

## Project Structure

```txt
backend/   Express API, database models, migrations, auth, services, appointments
frontend/  React application for clients, providers, and admins
docs/      Capstone and instructor delivery documents
```

## Running With Docker

From the project root:

```bash
docker compose -f backend/docker-compose.yml up --build
```

The backend runs on:

```txt
http://localhost:8081/api
```

Health check:

```txt
http://localhost:8081/api/health
```

To stop the containers:

```bash
docker compose -f backend/docker-compose.yml down
```

## Default Seeded Users

| Role     | Email              | Password     |
| -------- | ------------------ | ------------ |
| Admin    | admin@ndova.com    | Admin@123    |
| Provider | provider@ndova.com | Provider@123 |
| Client   | client@ndova.com   | Client@123   |
