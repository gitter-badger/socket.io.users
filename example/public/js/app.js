/* Just jquery for now - no use of angular on this example. */

function appendEye(eye){
    $("#eyesArea").append("<br/> <b>"+eye.id+ " </b> watching <i>"+ eye.article+"</i> from "+eye.town); 
}

function clearEyes(){
    $("#eyesArea").html("");
}

$(document).ready(function(){
    var socket = io();

     socket.on('eye added',function(eye){
        appendEye(eye);
    });

    socket.on('connect',function(){
        console.log('Connected to server.');
    });

    socket.on('push eyes',function(eyes){
        if(eyes.length ===0){
            clearEyes();
        }
        for(var i=0;i< eyes.length;i++){
            appendEye(eyes[i]);   
        }
    });

   

    $("#viewArticleBtn").click(function(){
        var username = $("#usernameTxt").val();
        var town = $("#townTxt").val();
        var articleSublink = $("#articleTxt").val();
        var eye = {
            town:town,
            article: articleSublink
        };

        socket.emit('article read',eye);
    });

});