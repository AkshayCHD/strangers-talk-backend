const express = require('express')
const socket = require('socket.io')

const app = express();
const PORT = process.env.PORT || 4000
const server = app.listen(PORT, () => {
    console.log(`listening to server ${PORT}`)
})

const io = socket(server);

// store connections of all active sockets
let allUsers = {};
// store room addresses for all sockets
let rooms = {};
// store sockets that haven't been paired
let queue = [];


const removeSocketFromQueue = (socketId) => {
	if(queue[0] !== undefined) {
			if(queue[0].id === socket.Id) {
					queue.pop();
			}
	}
}

const createRoomForIdleSockets = (socket) => {
	if(socket === undefined) {
		return
	}
	if(queue.length > 0) {
		if(queue[0].id == socket.id) {
			return;
		}
		let peer = queue.pop();
		let room = socket.id + "#" + peer.id;

		peer.join(room);
		socket.join(room);

		rooms[peer.id] = room;
		rooms[socket.id] = room;

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

	socket.on('logout', function () {
		removeSocketFromQueue(socket.id)
		let room = rooms[socket.id];
		if(room) {
				let peerID = room.split('#');
				peerID = peerID[0] === socket.id ? peerID[1] : peerID[0];
				createRoomForIdleSockets(allUsers[peerID]);
		}
	});

	// disconnect user from the platform
	socket.on('disconnect', () => {
		console.log(`Connection Closed with ${socket.id}`)
		removeSocketFromQueue(socket.id)

		let room = rooms[socket.id];
		if(room !== undefined) {
			let peerID = room.split('#');
			if(io.sockets.sockets[peerID[0]]) {
					io.sockets.sockets[peerID[0]].leave(rooms[peerID[0]])
					removeSocketFromQueue(peerID[0])
			}
			if(io.sockets.sockets[peerID[1]]) {
					io.sockets.sockets[peerID[1]].leave(rooms[peerID[1]])
					removeSocketFromQueue(peerID[1])
			}

			delete rooms[socket.id]
			delete allUsers[socket.id]
		}
	});
})
