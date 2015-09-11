/// <reference path="../typings/socket.io/socket.io.d.ts" />
import User from "./User";
import Namespaces from "./Namespaces";
import {EventEmitter} from 'events';

export var CONNECTION_EVENTS: string[] = ['connected', 'connection', 'connect', 'connect_error', 'connect_timeout',
  'error', 'reconnect', 'reconnect_error', 'disconnect', 'disconnected'
];

class Users extends EventEmitter {

  namespace: string;
  users: User[] = [];

  constructor(namespace: string = "/") {
    super();
    this.namespace = namespace;
    Namespaces.attach("/", this);
  }

  static of(namespace: string = "/"): Users {
    let _users = Namespaces.get(namespace);
    if (_users === undefined) {
      _users = new Users(namespace);

    }
    return _users;
  }

  takeId = function(request: any): string | number {
    if (request._query !== undefined && request._query !== '' && request._query.id !== undefined) {
      return request._query.id;
    } else {
      return request.headers.cookie.substr(request.headers.cookie.indexOf('sid=') + 4);
    }
  }

  create(socket: SocketIO.Socket): User {
    let _user = new User();
    _user.id = this.takeId(socket.request);
    _user.attach(socket);
    return _user;
  }

  getById(id: string|number): User {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].id === id) {
        return this.users[i];
        break;
      }
    }
    return undefined;
  }

  get(socket: SocketIO.Socket): User {
    return this.getById(this.takeId(socket.request));
  }

  list(): User[] {
    return this.users;
  }

  size(): number {
    return this.users.length;
  }

  push(_user: User): void {
    this.users.push(_user);
  }

  add(socket: SocketIO.Socket): User {
    let _user = this.create(socket);
    this.push(_user);
    return _user;
  }

  indexOf(user: User): number {
    return this.users.findIndex((_user) => {
      return user.id === _user.id;
    });
  }

  remove(user: User): void {
    user.detach();

    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].id === user.id) {
        this.users.splice(i, 1);
        break;
      }
    }
  }
  
  //returns users are joined/inside on this specific room  room = SocketUsers.prototype.in = SocketUsers.prototype.from 
  room(room: string): User[] {
    let _usersConnectedToRoom: User[] = [];
    for (let i = 0; i < this.users.length; i++) {
      let _user = this.users[i];

      if (_user.rooms.indexOf(room) !== -1) {
        _usersConnectedToRoom.push(_user);
      }
    }
    return _usersConnectedToRoom;
  }

  in(room: string): User[] {
    return this.room(room);
  }

  from(room: string): User[] {
    return this.room(room);
  }

  //We call this when we are doing manual update to a user object, example:
  // users.on('update',function(user) { console.log (' A user with id: '+ user.id +' has been updated from code');});
  // var user= users.get('userid123456'); user.store.anyproperty='aproperty'; users.update(user);

  update(user: User): void {
    this.emit('update', user);
  }

  /* emitAll(event: string): void {
     // var args = Array.prototype.slice.call(arguments);
     this.users.forEach((_user) => {
       _user.emit(event);
     });
   };*/

  emitAll(...args: any[]): void {
    // var args = Array.prototype.slice.call(arguments);
    this.users.forEach((_user) => {
      _user.emit(args);
    });
  }

  /*links  the events (this eventemmiter's) that this socket have to listen.
  (similar to socket.on('evt',callback) but I did this to be more easly to exctract the logic in different js files)*/
  registerSocketEvents(currentUser: User): void {
    let self = this;
    Object.keys(this.listeners).forEach(key=> {

      if (CONNECTION_EVENTS.indexOf(key) !== -1) {
        return;
      }

      let listener = key.slice(0);
      let socketWhichEmits = currentUser.socket; //the socket which emits this event.
      //console.log('Register event for: ' + listener);
      
      currentUser.socket.on(listener, function() {

        currentUser.socket = socketWhichEmits;
        var args = Array.prototype.slice.call(arguments);
        args.unshift(currentUser);
        args.unshift(listener);
        self.emit.apply(self, args); // AUTO PREPEI KAPWS NA TO ALLAKSW OPWS NANE TO EIXA, kanonika 9eprepe na itan this.emit.apply(this,this.listeners[key]) me arrow function to this na einai to Users.

      });
    });

  }

}

export default Users;