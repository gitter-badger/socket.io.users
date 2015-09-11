import Users from "./Users";

export type SocketUserList = {
    [namespace: string]: Users

};

class Namespaces {
    private static socketUsersList: SocketUserList = {};  // "namespace": new SocketUsers()
    
    static attach(namespace: string, socketUsersObj: Users): void {
        if (!Namespaces.socketUsersList.hasOwnProperty(namespace)) {
            socketUsersObj.namespace = namespace;
            Namespaces.socketUsersList[namespace] = socketUsersObj;
        }
    }

    static get(namespace: string): Users {
        if (Namespaces.socketUsersList.hasOwnProperty(namespace)) {
            return Namespaces.socketUsersList[namespace];
        }

        return undefined;
    }

}


//let _namespaces = new Namespaces();
export default Namespaces;