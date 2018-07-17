// app/routes.js

//load all the things needed.
var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);


var express  = require('express');
var app = express();

var functions = require('./functions');


// ==========================================
module.exports = function(app, passport) {

    app.get('/login', functions.loginfunc);


    app.post('/login', function(req, res, next){
        passport.authenticate('local-login', function (err, user, info) {
            //this function is called when LocalStrategy returns done function with parameters

            //if any error , throw error to default error handler
            if(err) throw err;

            //if username or password doesn't match
            if(!user){
                return res.send(info);
            }

            //this is when login is successful
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                console.log(req.body);
                afdss = "  fff jju ggg ii         hjj   ";
                console.log(afdss.replace(/ /g,''));
                return res.redirect('/dashboard');
            });
            
        })(req,res,next),
        function(req, res) {
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/dashboard');
        }
    });
 



    // LOGOUT ==============================
    app.get('/logout', functions.logoutfunc);

    app.get('/create', functions.isLoggedInfunc,functions.create_open_elective);
    app.post('/create',functions.isLoggedInfunc, functions.create_oe_post_form);
    // =====================================

    app.get('/dashboard', functions.isLoggedInfunc, functions.dashboard);

    app.get('/manage', functions.isLoggedInfunc, functions.manage);

    app.get('/elective/:token',functions.isLoggedInfunc, functions.elective_stats);

    app.get('/past',functions.isLoggedInfunc, functions.past_electives);

    app.get('/present',functions.isLoggedInfunc, functions.present_electives);

    app.get('/student-data',functions.isLoggedInfunc,functions.student_data)

    app.get('/courses',functions.isLoggedInfunc, functions.display_courses);

    app.get('/courses/:id',functions.isLoggedInfunc, functions.elective_courses);

    app.get('/admin_activity',functions.isLoggedInfunc, functions.admin_activity);
    
    app.get('/reset/:id', functions.isLoggedInfunc,functions.reset_archive);

    app.get('/settings',functions.isLoggedInfunc, functions.settings);

    app.get('/download', function(req, res){
          var file = 'G:/Elective/Random/views/pics/avatar.png';
          res.download(file); // Set disposition and send it.
    });

}

