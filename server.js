var express = require('express');
var bodyParser = require('body-parser');
var ejsLayouts = require('express-ejs-layouts');
var session = require('express-session');
var passport = require('./config/ppConfig');
const dotenv = require('dotenv');
dotenv.load();
var flash = require('connect-flash');
var isLoggedIn = require('./middleware/isLoggedIn');

var app = express();

app.set('view engine', 'ejs');
app.use(ejsLayouts);

// set up session

console.log('SERVER goes live in 3.. 2.. 1');

// tell server wheres my static file
app.use(express.static('public'));

// configure body-parser
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function (req, res, next) {
  // before every route, attach the flash messages and current user to res.locals
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

// renders homepage
console.log('Homepage Loading...');
app.get('/', function (req, res) {
  res.redirect('/auth_biz/');
});

// BROWSE page
app.get('/browse', function (req, res) {
  if (req.query.range) {
    var rangeData = req.query.range;
    console.log(req.body.range);
    db.listing.findAll({
      where: {
        value: {
          gt: parseInt(rangeData)
        }
      },
      order: 'value DESC'
    }).then(function (obj) {
      res.render('browse', {data: obj});
    });
  } else {
    db.listing.findAll().then(function (data) {
      res.render('browse', {data: data});
    });
  }
});

// renders login page
app.get('/login', function (req, res) {
  console.log('Log in page loading...');
  res.render('accounts/login/login');
});

// renders pre-signup page
app.get('/pre-signup', function (req, res) {
  console.log('Pre-signup Loading...');
  res.render('accounts/signup/pre-signup');
});

// renders sign up page for the young
app.get('/signup', function (req, res) {
  res.render('accounts/signup/signup');
});

// About page
app.get('/about', function (req, res) {
  res.render('about');
});

// New Listing page
app.get('/new_listing', isLoggedIn, function (req, res) {
  res.render('listings/new_listing');
});

// FINAL New Listing page
app.get('/final_new_listing', isLoggedIn, function (req, res) {
  res.render('listings/final_new_listing');
});

// renders DASHBOARD after SUCCESSFUL LOGGING IN
app.get('/user_dashboard', isLoggedIn, function (req, res) {
  res.render('dashboard/user_dashboard');
});

app.get('/user_setting', isLoggedIn, function (req, res) {
  res.render('dashboard/user_setting');
});

app.use('/auth', require('./controllers/auth'));

app.use('/auth_biz', require('./controllers/auth_biz'));

var server = app.listen(process.env.PORT || 3000);

module.exports = server;
