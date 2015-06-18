var users = require('./../../index').Users; //IMPORTANT

module.exports = function(io){

    var eyes = [];
    var addEye = function(eye){
        var exists=false;
        for(var i =0; i <eyes.length; i++){
            if( eyes[i].id === eye.id && eyes[i].article === eye.article ){
                exists=true;
                break;
            }

        }
        if(exists===false){
            eyes.push(eye);   
        }
        return !exists;
    };

    var getByArticle = function(article){
        for(var i =0; i <eyes.length; i++){
            if( eyes[i].article === article ){
                return eye;
            }

        }
    };

    users.on('connected',function(user){
        console.log('A user has connected to EYE.'); 
    });

    users.on('connection',function(user){
        io.to(user.socket.id).emit('push eyes',eyes);
        user.socket.on('article read',function (eye){
            eye.id = user.id;
            if(addEye(eye)){
                io.emit('eye added',eye); 
                io.to(user.id).emit('eye added',{id: 'Myself',article: 'You have seen an article', town: 'Server'});

            }
        }); 
    });

    users.on('disconnected',function(user){
        console.log('A user has been disconnected from EYE.'); 
    });

};