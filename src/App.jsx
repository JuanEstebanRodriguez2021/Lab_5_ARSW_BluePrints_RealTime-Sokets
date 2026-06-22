import { useEffect, useRef, useState } from 'react'
import { createSocket } from './lib/socketIoClient.js'

const API_BASE = import.meta.env.VITE_API_BASE
const IO_BASE = import.meta.env.VITE_IO_BASE

export default function App() {
  const [author, setAuthor] = useState('juan')
  const [name, setName] = useState('plano-1')

  const canvasRef = useRef(null)
  const socketRef = useRef(null)
  const pointsRef = useRef([])

  function drawAll(bp) {
    pointsRef.current = bp.points ?? []

    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, 600, 400)

    if (bp.points.length === 0) return

    ctx.beginPath()

    bp.points.forEach((p, i) => {
      if (i === 0) {
        ctx.moveTo(p.x, p.y)
      } else {
        ctx.lineTo(p.x, p.y)
      }
    })

    ctx.stroke()
  }

  useEffect(() => {
    fetch(`${API_BASE}/api/blueprints/${author}/${name}`)
      .then(r => {
        if (!r.ok) {
          return { points: [] }
        }
        return r.json()
      })
      .then(data => {
        const bp = data.data ?? data
        drawAll(bp)
      })
      .catch(() => drawAll({ points: [] }))
  }, [author, name])

  useEffect(() => {
    socketRef.current?.disconnect()

    const socket = createSocket(IO_BASE)
    socketRef.current = socket

    const room = `blueprints.${author}.${name}`

    socket.on('connect', () => {
      socket.emit('join-room', room)
    })

    socket.on('blueprint-update', (upd) => {
      pointsRef.current = [
        ...pointsRef.current,
        ...upd.points
      ]

      drawAll({
        points: pointsRef.current
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [author, name])

  function onClick(e) {
    if (!socketRef.current?.connected) return

    const rect = e.target.getBoundingClientRect()

    const point = {
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top)
    }

    const room = `blueprints.${author}.${name}`

    socketRef.current.emit('draw-event', {
      room,
      author,
      name,
      point
    })

    pointsRef.current = [
      ...pointsRef.current,
      point
    ]

    drawAll({
      points: pointsRef.current
    })
  }

  return (
    <div
      style={{
        fontFamily: 'Inter, system-ui',
        padding: 16,
        maxWidth: 900
      }}
    >
      <h2>Blueprints Real-Time Collaboration (Socket.IO)</h2>

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 12
        }}
      >
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author"
        />

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Blueprint"
        />
      </div>

      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        onClick={onClick}
        style={{
          border: '1px solid #ddd',
          borderRadius: 12,
          cursor: 'crosshair'
        }}
      />

      <p style={{ opacity: 0.7, marginTop: 8 }}>
        Open two browser tabs and click on the canvas to see
        real-time collaboration using Socket.IO.
      </p>
    </div>
  )
}
