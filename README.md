# Lab 5 ARSW BluePrints Real-Time Collaboration with Socket.IO - Juan Esteban Rodriguez

## Overview

This project implements real-time collaborative drawing for BluePrints (Lab 4) using **React**, **Node.js**, and **Socket.IO**.

The solution combines:

- **Spring Boot API** for REST operations and blueprint persistence. Located in the lab 4 repository
- **Node.js + Socket.IO** server for real-time communication.
- **React (Vite)** frontend for drawing and collaboration.

The application allows multiple users to open the same blueprint and see drawing updates almost instantly.

---



## Technologies

- React 
- Vite
- Socket.IO
- Node.js
- Express
- Spring Boot
- PostgreSQL

---

# Setup

## 1. Start the Spring Boot API

Run the Spring Boot application:

```bash
mvn spring-boot:run
```

REST API:

```
http://localhost:8082
```

---

## 2. Install frontend dependencies

Inside `frontend-react`:

```bash
npm install
```

Install Socket.IO server dependencies:

```bash
npm install express socket.io cors
```

---

## 3. Environment variables

Create a file named `.env.local` in the project root:

```env
VITE_API_BASE=http://localhost:8082
VITE_IO_BASE=http://localhost:3001
```

---

## 4. Start the Socket.IO server

```bash
npm run server
```

Server:

```
http://localhost:3001
```

---

## 5. Start the React application

```bash
npm run dev
```

Frontend:

```
http://localhost:5173
```

---

# REST Endpoints Used

The frontend loads the initial state of the blueprint using HTTP.

### Get Blueprint

```http
GET /api/blueprints/{author}/{name}
```

Example:

```http
GET /api/blueprints/juan/plano-1
```

Response:

```json
{
  "author": "juan",
  "name": "plano-1",
  "points": [
    {
      "x": 10,
      "y": 10
    },
    {
      "x": 40,
      "y": 50
    }
  ]
}
```

---

# Socket.IO Events

## Join Room

Client → Server

```javascript
socket.emit(
  'join-room',
  `blueprints.${author}.${name}`
)
```

---

## Draw Event

Client → Server

```javascript
socket.emit(
  'draw-event',
  {
    room: `blueprints.${author}.${name}`,
    author,
    name,
    point: {
      x,
      y
    }
  }
)
```

---

## Blueprint Update

Server → Clients

Event:

```javascript
'blueprint-update'
```

Payload:

```json
{
  "author": "juan",
  "name": "plano-1",
  "points": [
    {
      "x": 120,
      "y": 80
    }
  ]
}
```

---

# Design Decisions

## Rooms

A Socket.IO room was created for every blueprint.

Naming convention:

```
blueprints.{author}.{name}
```

Examples:

```
blueprints.juan.plano-1
blueprints.john.house
blueprints.maria.garden
```

This approach guarantees that:

- only users viewing the same blueprint receive updates;
- multiple blueprints can be edited simultaneously;
- communication remains isolated and efficient.

---

## Incremental Updates

Instead of sending the entire blueprint after every click, only the new point is broadcast:

```json
{
  "points": [
    {
      "x": 120,
      "y": 80
    }
  ]
}
```

Advantages:

- lower network traffic;
- lower latency;
- better scalability.

---

## State Loading

When a blueprint is opened:

1. The frontend performs an HTTP GET request to obtain existing points.
2. The user joins the corresponding Socket.IO room.
3. Every new point is distributed through `blueprint-update`.

---

# Testing

1. Start Spring Boot.
2. Start the Socket.IO server.
3. Start the React application.
4. Open:

```
http://localhost:5173
```

in two browser tabs.

5. Use the same values:

```
Author: juan
Blueprint: plano-1
```

6. Click on the canvas.

Expected result:

- the point appears immediately in the current tab;
- the point is replicated in the second tab;
- both clients remain synchronized in real time.

---

# Project Structure

```
frontend-react
│
├── src
│   ├── App.jsx
│   ├── main.jsx
│   └── lib
│       └── socketIoClient.js
│
├── server.js
├── package.json
├── .env.local
└── vite.config.js
```

---

# Future Improvements

- Persist points in PostgreSQL.
- Add authentication and authorization.
- Support multiple Node.js instances using Redis Adapter.
- Add metrics and connection monitoring.
- Implement undo/redo functionality.

