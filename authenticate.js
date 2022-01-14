var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');

var config = require('./config');

exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//methods in line 6-7 are provided on the User schema model by passport-local-mongoose plugin
//lines 6-7 handles support for 'sessions' in passport

exports.getToken = function(user) { 
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600})     //3600s; in 1 hr later, jwt needs to be renewed 
    //this creates the token, 'user' is the payload, 2rd param is the secret key

};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts, 
    //specifies how jwt should be extracted from the incoming req msg
    (jwt_payload, done) => {
        console.log('JWT payload: ', jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);    //'done' in passport takes 3 params
                //1st: err, 2nd: user?, 3rd: info?
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false});
//this uses the token that comes in the auth header and verifies the user

exports.verifyAdmin = function(req, res, next) {
    user.findOne({_id: req.user._id})
    .then((user) => {
        console.log("User: ", req.user);
        if (user.admin)
            next();
        else {
            err = new Error('You are not authorised to perform this operation!');
            err.status = 403;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err))
}