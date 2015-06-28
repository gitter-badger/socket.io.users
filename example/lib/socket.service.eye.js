var users = require('./../../index').Users.of('/eye'); //IMPORTANT

module.exports = function(io){

    this.name = 'eye';
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


    users.on('connected', function(user){
        console.log('A user has ('+user.id+') connected to EYE.');
    });


    users.on('connection', function(user){
        console.log('push eyes');
        io.to(user.socket.id).emit('push eyes',eyes);
        user.socket.on('article read',function (eye){
            eye.id = user.id;
            if(addEye(eye)){
                io.emit('eye added',eye);
                io.to(user.id).emit('eye added',{id: 'Myself',article: 'You have seen an article', town: 'Server'});

            }
        });
    });

};
