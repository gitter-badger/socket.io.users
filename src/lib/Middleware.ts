import Users from "./Users";

var Middleware = () => {
	return (socket: SocketIO.Socket, next: () => any) => {
		let users = Users.of(socket.nsp.name);
		//if (users.namespace === socket.nsp.name) {
		let user = users.get(socket);

		if (user !== undefined) {
			//when user opens a new tab or new browser window.
			user.attach(socket);

		} else {
			user = users.add(socket);
			users.emit('connected', user);
			//   call('connected',user);
		}



		users.emit('connection', user);
		socket.on('disconnect', function() {
			user.detachSocket(socket);
			if (user.sockets.length === 0) {
				users.remove(user);
				users.emit('disconnected', user);
			}
		});

		users.registerSocketEvents(user);
		next();

	};
};

export default Middleware;

