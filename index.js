const express = require('express')
const socket = require('socket.io')

const app = express();
const PORT = process.env.PORT || 4000
const server = app.listen(PORT, () => {
    console.log(`listening to server ${PORT}`)
})

const io = socket(server);

// store connections of all active sockets
let allUsers = [];
// store sockets that haven't been paired
let queue = [];

io.on('connection',  (socket) => {
	console.log(`Connection Established with ${socket.id}`)

	// login user to the platform
	socket.on('login', function (data) {
		allUsers[socket.id] = socket;
		queue.push(socket.id)
		socket.emit('addedToQueue', {'index': queue.length})
	});
})
