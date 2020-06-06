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

const createRoomForIdleSockets = (socket) => {
	if(queue.length > 0) {
		let peer = queue.pop();
		let room = socket.id + "#" + peer.id;

		peer.join(room);
		socket.join(room);

		peer.emit('roomCreated', {'room': room});
		socket.emit('roomCreated', {'room': room});
	} else {
		queue.push(socket)
		socket.emit('addedToQueue', {'index': queue.length})
	}
}
io.on('connection', (socket) => {
	console.log(`Connection Established with ${socket.id}`)

	// login user to the platform
	socket.on('login', () => {
		allUsers[socket.id] = socket;
		createRoomForIdleSockets(socket);
	});
})
