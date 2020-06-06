const io = require('socket.io-client')
, assert = require('assert')
, expect = require('expect.js');

describe('Suite of unit tests', () => {

	let socket1;
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

	afterEach((done) => {
			if(socket1.connected) {
					console.log('disconnecting...');
					socket1.disconnect();
			} else {
					console.log('no connection to break...');
			}
			done();
	});
});
