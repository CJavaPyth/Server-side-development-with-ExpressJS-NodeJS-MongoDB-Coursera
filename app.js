var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate = require('./authenticate');
var config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');  
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
var uploadRouter = require('./routes/uploadRouter');

const mongoose = require('mongoose');

const Dishes = require('./models/dishes');

const url = config.mongoUrl
const connect = mongoose.connect(url);

// Connection URL
const url = config.mongoUrl;
const connect = mongoose.connect(url, {
    useMongoClient: true,
    /* other options */
  });

connect.then((db) => {
    console.log("Connected correctly to server");
}, (err) => { console.log(err); });

connect.then((db) => {
  console.log("Connected correctly to server");
}, (err) => { console.log(err); });

var app = express();

//app.all('*', (req, res, next) => {
  //if (req.secure) {
    //return next();
  //}
  //else {
    //res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url)
  //}
//})   //for all requests, no matter what the path in the request is

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('12345-67890-09876-54321')); //handle signed cookies

// app.use(session({   //set up session middleware    //no longer using sessions
//   name: 'session-id',
//   secret: '12345-67890-09876-54321',
//   saveUninitialised: false,
//   resave: false,
//   store: new FileStore()  
// }));

app.use(passport.initialize());
// app.use(passport.session());   //no longer using sessions

app.use('/', indexRouter);    //so that incoming user can access 'index', 'users' file without being authenticated
app.use('/users', usersRouter);



app.use(express.static(path.join(__dirname, 'public')));  


app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/imageUpload', uploadRouter);
app.use('/favorites',favoriteRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
