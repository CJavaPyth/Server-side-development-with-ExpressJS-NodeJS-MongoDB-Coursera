var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
const cors = require('./cors');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  Users.find({})
  .then((users) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(users);
  }, (err) => next(err))
  .catch((err) => next (err));
});

router.post('/signup', cors.corsWithOptions, (req, res, next) => {
  User.register(new User({username: req.body.username}), 
  req.body.password, (err, user) => {//if the user already exists
    if (err) {   //should not allow a duplicate signup
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err})  //construct a json object with err as the value for the err property and send back to client
    }
    else {
      if (req.body.firstname)
        user.firstname = req.body.firstname;
      if (req.body.lastname)
        user.firstname = req.body.lastname;
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
          return; 
        }
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', ' application/json');
          res.json({success: true, status: 'Registration Successful!'})        
        });
      })
    }
  })
});

router.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => {

    var token = authenticate.getToken({_id: req.user._id}); //create a token with payload of: user_id
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'})  
});

router.get('/logout', cors.corsWithOptions, (req, res) => {
  if (req.session) {
    req.session.destroy();    //session is destroyed and info is removed from server side pertaining to the session
    res.clearCookie('session-id');  //asking client to remove cookie
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);    
  }
});

module.exports = router;
