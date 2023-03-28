const express = require('express')
require('dotenv').config()
const cors = require('cors')
const morgan = require('morgan')
const http = require('http')
const { Server } = require('socket.io')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(express.json())
app.use(cors())
if (process.env.MODE !== 'pro') {
  app.use(morgan('dev'))
}
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.IO_URL,
    methods: ['GET', 'POST'],
  },
})

let users = []

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ email, name, room }) => {
    const user = { id: socket.id, email, name, room }
    users.push(user)
    updateUsers(users)
    socket.join(user.room)
    const currentUsers = users
      .filter((x) => x.room === user.room)
      .map((x) => x.name)
    io.to(user.room).emit('adminMsg', {
      currentUsers,
    })
  })

  socket.on('leaveRoom', ({ email }) => {
    const index = users.findIndex((x) => x.email === email)
    deleteUser(index)
  })

  socket.on('disconnect', () => {
    const index = users.findIndex((x) => x.id === socket.id)
    deleteUser(index)
  })

  socket.on('chatMsg', ({ email, name, room, msg }) => {
    io.to(room).emit('chatMsg', { email, name, msg })
  })

  function deleteUser(index) {
    if (index !== -1) {
      const user = users.splice(index, 1)[0]
      updateUsers(users)
      const currentUsers = users
        .filter((x) => x.room === user.room)
        .map((x) => x.name)
      io.to(user.room).emit('adminMsg', {
        currentUsers,
      })
    }
  }

  function updateUsers(data) {
    fs.writeFile('./db/users.json', JSON.stringify(data), (err) => {
      if (err) {
        console.log(err)
      }
    })
  }
})

if (process.env.MODE === 'pro') {
  app.use(express.static(path.join(__dirname, '../client/build')))
  app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'))
  })
}

const PORT = process.env.PORT || 5011
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
