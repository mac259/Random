//initializing and loading things
var express  = require('express');
var app = express();
var port = process.env.PORT || 1111;
var serv = require('http').Server(app);
var passport = require('passport');

var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var configDB = require('./config/database.js');

require('./config/passport')(passport); 

// set up of express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs'); // set up ejs for templating

app.use(express.static(__dirname + '/views'));

// required for passport
app.use(session({ secret: "winteriscoming",
					 resave: true,
    				saveUninitialized: true,
						cookie: {
							httpOnly: true,
							secure: false
						} })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions



// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport


serv.listen('1111', function () {
	console.log('server initiated');
})
console.log('Visit port ' + port);

