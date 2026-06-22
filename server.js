import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'

const app = express()

app.use(cors())
app.use(express.json())

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*'
  }
})

const blueprints = new Map()

function key(author, name) {
  return `${author}:${name}`
}

app.get('/api/blueprints/:author/:name', (req, res) => {
  const { author, name } = req.params

  const points =
    blueprints.get(key(author, name)) || []

  res.json({
    author,
    name,
    points
  })
})

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('join-room', (room) => {
    socket.join(room)
    console.log(`${socket.id} joined ${room}`)
  })

  socket.on('draw-event', (data) => {
    const {
      room,
      author,
      name,
      point
    } = data

    const k = key(author, name)

    if (!blueprints.has(k)) {
      blueprints.set(k, [])
    }

    blueprints.get(k).push(point)

    socket.to(room).emit(
      'blueprint-update',
      {
        author,
        name,
        points: [point]
      }
    )
  })

  socket.on('disconnect', () => {
    console.log(
      'Client disconnected:',
      socket.id
    )
  })
})

const PORT = 3001

server.listen(PORT, () => {
  console.log(
    `Socket.IO server running on port ${PORT}`
  )
})