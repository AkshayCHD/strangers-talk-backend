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
			socket1.disconnect();
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
				done();
			})
		});
	});

});
