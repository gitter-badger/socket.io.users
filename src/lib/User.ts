/// <reference path="../typings/socket.io/socket.io.d.ts" />
class User {
  id: string|number;
  socket: SocketIO.Socket; //last added socket / or the current user's socket who (if) emits an event
  sockets: SocketIO.Socket[] = [];
  rooms: string[] = [];
  ip: string; //last machine's ip which user has connected to.
  remoteAddresses: string[] = [];
  store: any = {};



  //sync, when user OR socket is connected and/or added to the users list
  attach(socket: SocketIO.Socket): void {
    //we could use socket.rooms I know it exists but I am sure I will need user's rooms later on...
    this.socket = socket;

    this.ip = this.socket.client.request.headers['x-forwarded-for'] || this.socket.client.conn.remoteAddress || this.socket.conn.remoteAddress || this.socket.request.connection.remoteAddress;
    // if(this.ip.indexOf(':')===0){
    //   //means IPV6
    //   this.ip = this.ip.substring(7); //::ffff
    //auto einai gia na to kanw IPV4 alla isws 9eloun ipv6 oi developers giauto to afeinw .
    // }
    //this.ip = this.socket.request.connection.remoteAddress;
    if (this.remoteAddresses.indexOf(this.ip) === -1) {
      //means that the user has connectly FROM DIFFERENT MACHINE BUT IT IS THE SAME USER BECAUSE OF GET NOW CAN WORKS WITH io _query.id.
      this.remoteAddresses.push(this.ip);

    }

    this.sockets.push(socket);
    this.socket.join(this.id.toString());
    if (this.rooms.length > 0) {
      for (let i = 0; i < this.rooms.length; i++) {
        this.socket.join(this.rooms[i]);
      }
    }
  }

  detachSocket(socket: SocketIO.Socket): void {
    for (let i = 0; i < this.sockets.length; i++) {
      if (this.sockets[i].id === socket.id) {
        this.sockets.splice(i, 1);
        break;
      }
    }
  }

  detach(): void {
    this.leaveAll();
  }

  join(room: string): boolean {
    let socketAlreadyInRoom = this.socket.rooms.indexOf(room) !== -1;

    if (this.rooms.indexOf(room) !== -1) {
      if (!socketAlreadyInRoom) {
        this.socket.join(room);
      }
    } else {
      for (let i = 0; i < this.sockets.length; i++) {
        this.sockets[i].join(room);
      }
      this.rooms.push(room);
    }

    return socketAlreadyInRoom; //just return true/false if socket was already inside this room, no error happens.  This is only for this socket, maybe I have problem if some1 try sync from socket to other socket but in the same user, if then I will fix it when the time arrives.
  }

  leave(room: string): void {
    let index = this.rooms.indexOf(room);

    if (index !== -1) {
      this.rooms.splice(index, 1);

      for (let i = 0; i < this.sockets.length; i++) {
        this.sockets[i].leave(room);
      }

    }
  }

  leaveAll(): void {
    if (this.rooms.length > 0) {
      for (let i = 0; i < this.rooms.length; i++) {
        this.leave(this.rooms[i]);

      }
    }
  }

  in(...rooms: string[]): boolean {
    let len = rooms.length;
    let ok = 0;
    for (let i = 0; i < len; i++) {

      if (this.rooms.indexOf(rooms[i]) !== -1) {
        ok++
      }
      if (ok == len) {
        return true;
      }
    }
    return false;
  }

  belong(...rooms: string[]): boolean {
    return this.in(rooms.toString());
  }

  set(key: string, value: any, callback: () => void): void { //property,value,callback(callback is unnessecary for now)
    this.store[key] = value;
    if (callback !== undefined) {
      callback();
    }
  }

  get = function(key: string): any {
    if (this.store.hasOwnProperty(key)) {
      return this.store[key];
    } else {
      return undefined;
    }
  }

  toString(): string {
    return this.id.toString();
  }

  emit(...args: any[]): void {
    //this is async way as far I know.
    // var args = Array.prototype.slice.call(arguments);
    this.sockets.forEach((_socket) => {
      _socket.emit.apply(_socket, args);
    });

  }


  to(room: string): SocketIO.Socket {
    this.socket.rooms = this.socket.rooms || [];
    if (!~this.socket.rooms.indexOf(room)) this.socket.rooms.push(room);
    return this.socket; //this happens because of THIS socket.emit. this function sends to all sockets inside this room data EXCEPT THIS.SOCKET.ID (look on socket.io.socket.js on emit = ).
  }
}


export default User;
