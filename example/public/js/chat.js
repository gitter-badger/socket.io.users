/* Just jquery for now - no use of angular on this example. */
var rooms = []; //or conversations


function joinConversation(room){
    rooms.push(room);

    appendConversation(room);
}

function appendConversation(room){
    $("#conversationsArea").append("<li>"+room+"</li>");
}

function appendUser(user){
    $("#usersArea").append("<li>"+user+"</li>");    
}



function appendMessage(data){
    $("#messagesArea").append("<br/>("+data.room+") <b>"+data.user+ " :</b> "+data.message); 
}

function clearConversations(){
    $("#conversationsArea").html("");   
    rooms = [];
}

function clearUsers(){
    $("#usersArea").html("");   
}


function clearMessages(){
    $("#messagesArea").html("");
}



$(document).ready(function(){
    var socket = io();

    socket.on('connect',function(){
        console.log('Connected to server.');
    });
    
    socket.on('set username',function(username){
        console.log('Your username is: '+username);
        window.alert('Your username setted by server is: '+username);

    });
    
    socket.on('conversation push',function(_conversations){
        console.log('-----GET----');
        if(_conversations.length ===0){
            clearMessages();
            clearConversations();
            clearUsers();
            console.log('clear conversations');
        }
        console.log('Received ' + _conversations.length+ ' conversations ');
        for(var i=0;i< _conversations.length;i++){
            joinConversation(_conversations[i].room);
            console.log('join to '+ _conversations[i].room);
            for(var j=0; j < _conversations[i].users.length; j++){
                appendUser(_conversations[i].users[j]);
                console.log('inside user: ' + _conversations[i].users[j]);

            }
        }
    });



    socket.on('conversation user added',function(data){
        //data = room, user  
        appendUser(data.user);
    });

    socket.on('conversation message added',function(data){
        appendMessage(data);
    });


    $("#sendMessageBtn").click(function(){
        var msg = $("#messageTxt").val();
        console.dir(rooms);
        var data = {
            room:rooms[0],
            message: msg
        };

        socket.emit('conversation message',data);
        console.log('sending message to '+data.room);
        $("#messageTxt").val("");
    });


    $("#joinConversationBtn").click(function(){
        var roomName = $("#joinConversationTxt").val();

        if(rooms.indexOf(roomName)!==-1){
            window.alert('You are already in this Room!');

        }else{
            socket.emit('conversation join', roomName);
            console.log('Emit join to: ' +roomName);

            joinConversation(roomName);
            $("#joinConversationTxt").val("");}
    });

});