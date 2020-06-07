const express = require('express')
const socket = require('socket.io')
const service = require('./service')
const app = express();
const PORT = process.env.PORT || 4000
const server = app.listen(PORT, () => {
    console.log(`listening to server ${PORT}`)
})

const io = socket(server);

io.on('connection', (socket) => {
	console.log(`Connection Established with ${socket.id}`)

	// login user to the platform
	socket.on('login', () => {
		service.handleUserLogin(socket);
	});

	// logout user from the platform
	socket.on('logout', () => {
		service.handleUserInactivity(socket, io);
	});

	// disconnect user from the platform
	socket.on('disconnect', () => {
		service.handleUserInactivity(socket, io);
	});
})
