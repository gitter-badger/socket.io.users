var express = require('express');
var router = express.Router();
var userFactory = require('../database/user-factory');

router.get('/signin', function(req, res) {
  res.render('index.html');
});

router.post('/signin', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var userFound = userFactory.signin(username, password);
  
  if (userFound) {
    res.json(userFound);
  } else {
    res.status(404).send("Wrong password.");
  }

});

module.exports = router;
