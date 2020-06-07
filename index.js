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
		if(queue[0].id === socketId) {
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

const handleUserInactivity = (socket) => {
	removeSocketFromQueue(socket.id)
	let room = rooms[socket.id];
	if(room) {
			let peerID = room.split('#');
			peerID = peerID[0] === socket.id ? peerID[1] : peerID[0];
			if(io.sockets.sockets[socket.id] !== undefined) {
				io.sockets.sockets[socket.id].leave(rooms[socket.id])
				removeSocketFromQueue(socket.id)
			}
			if(io.sockets.sockets[peerID] !== undefined) {
				io.sockets.sockets[peerID].leave(rooms[peerID])
				removeSocketFromQueue(peerID)
			}
			delete rooms[socket.id]
			delete allUsers[socket.id]
			socket.emit("roomDeleted", {'room': room})
			if(allUsers[peerID] !== undefined) {
				allUsers[peerID].emit("roomDeleted", { 'room': room })
			}
			createRoomForIdleSockets(allUsers[peerID]);
	}
}

io.on('connection', (socket) => {
	console.log(`Connection Established with ${socket.id}`)

	// login user to the platform
	socket.on('login', () => {
		allUsers[socket.id] = socket;
		removeSocketFromQueue(socket.id)
		createRoomForIdleSockets(socket);
	});

	// logout user from the platform
	socket.on('logout', () => {
		handleUserInactivity(socket)
	});

	// disconnect user from the platform
	socket.on('disconnect', () => {
		handleUserInactivity(socket)
	});
})
