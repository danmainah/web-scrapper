var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dbpath = require('./dbkey');
const flash = require('connect-flash');
require('./auth/auth');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const db = require('./connectdb');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'scrap',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: dbpath })
}));


app.use(passport.authenticate('session')); // persistent login sessions
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


app.use('/', indexRouter);
app.use('/', usersRouter);

const UserModel = require('./models/userModel'); //import user model

// Passport Local Strategy
passport.use(UserModel.createStrategy());

// To use with sessions
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

  /// add middleware to check if user is authenticated
  const checkauthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    } else {
      // Redirect user to login page
      res.redirect('/login');
    }
  }



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
