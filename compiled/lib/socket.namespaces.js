var SocketUsersNamespaces   = function (){
    this.socketUsersList = {}; // "namespace": new SocketUsers()

    this.attach = function(namespace,socketUsersObj){
        if(!this.socketUsersList.hasOwnProperty(namespace)){
            socketUsersObj.namespace= namespace;
            this.socketUsersList[namespace] = socketUsersObj;
        }
    };

    this.get = function (namespace){
        if(this.socketUsersList.hasOwnProperty(namespace)){ 
            return this.socketUsersList[namespace];   
        }

        return undefined;
    };


};

module.exports = new SocketUsersNamespaces();