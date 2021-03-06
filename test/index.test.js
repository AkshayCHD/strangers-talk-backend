const io = require('socket.io-client')
, assert = require('assert')
, expect = require('expect.js');

describe('Suite of unit tests', () => {

	let socket1;
	let socket2;

	beforeEach((done) => {
			socket1 = io.connect('http://localhost:4000', {
					'reconnection delay' : 0
					, 'reopen delay' : 0
					, 'force new connection' : true
			});
			socket1.on('connect', () => {
					console.log('worked...');
					done();
			});
			socket1.on('disconnect', () => {
					console.log('disconnected...');
			})
	});

	beforeEach((done) => {
		// Setup
		socket2 = io.connect('http://localhost:4000', {
				'reconnection delay' : 0
				, 'reopen delay' : 0
				, 'force new connection' : true
		});
		socket2.on('connect', () => {
				console.log('worked...');
				done();
		});
		socket2.on('disconnect', () => {
				console.log('disconnected...');
		})
	});

	afterEach((done) => {
			if(socket1.connected) {
				console.log('disconnecting...');
				socket1.disconnect();
				done();
			}
	});

	afterEach((done) => {
		if(socket2.connected) {
			console.log('disconnecting...');
			socket2.disconnect();
			done();
		}
	});

	describe('Login Test Cases', () => {
		it('Connect a single socket client', (done) => {
			socket1.emit("login");
			socket1.on("addedToQueue", (data) => {

				expect(data.index).to.be.equal(1);
				done();
			})
		})
		it('Create room for 2 different socket IDs', (done) => {
			socket1.emit("login")
			socket2.emit("login")
			socket1.on("roomCreated", (data) => {
				expect(data.room).to.be.equal(socket2.id.toString() + "#" + socket1.id.toString());
				done();
			})
		});
	});
	describe('Logout Test Cases', () => {

		it('Add socket to queue if partner exits', (done) => {
				socket1.emit("login")
				socket2.emit("login")
				socket2.on("addedToQueue", (data) => {
					expect(data.index).to.be.equal(1);
					done();
				})
				socket1.emit("logout")
		});

		it('Delete room when you log out', (done) => {
			socket1.emit("login")
			socket2.emit("login")
			socket1.on("roomDeleted", (data) => {
				expect(data.room).to.be.equal(socket2.id.toString() + "#" + socket1.id.toString());
				done();
			})
			socket1.emit("logout")
		});

		it('Delete room when pair logs out', (done) => {
			socket1.emit("login")
			socket2.emit("login")
			socket1.on("roomDeleted", (data) => {
				expect(data.room).to.be.equal(socket2.id.toString() + "#" + socket1.id.toString());
				done();
			})
			socket2.emit("logout")
		});

		it('Rejoin other random socket if current pair logs out', (done) => {
			socket1.emit("login")
			socket2.emit("login")
			let socket3 = io.connect('http://localhost:4000', {
					'reconnection delay' : 0
					, 'reopen delay' : 0
					, 'force new connection' : true
			});
			socket2.emit('logout')
			socket3.emit('login')
			socket3.on("roomCreated", (data) => {
				expect(data.room).to.be.equal(socket3.id.toString() + "#" + socket1.id.toString());
				socket3.disconnect()
				done();
			})

		})

		it('Connect idle sockets if their pairs logout', (done) => {
			socket1.emit("login")
			socket2.emit("login")
			let socket3 = io.connect('http://localhost:4000', {
					'reconnection delay' : 0
					, 'reopen delay' : 0
					, 'force new connection' : true
			});

			let socket4 = io.connect('http://localhost:4000', {
					'reconnection delay' : 0
					, 'reopen delay' : 0
					, 'force new connection' : true
			});
			socket3.emit('login')
			socket4.emit('login')
			let count = 0;
			//done()
			socket1.on("roomCreated", (data) => {
				if(count == 1) {
					console.log(socket1.id)
					console.log(socket2.id)
					console.log(data)
					expect(data.room).to.be.equal(socket3.id.toString() + "#" + socket1.id.toString());
					done();
				}
				count++;
			})
			socket2.emit('logout');
			socket4.emit('logout');
		});

	});

});
