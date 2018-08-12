// app/routes.js

//load all the things needed.
var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);


var express  = require('express');
var app = express();

const multer = require('multer');
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    console.log("sdcfjhklnkdsjnvjhdbhfjbvjbdfjvj");
    cb(null, './views/excel/');
  },
  filename: function(req, file, cb) {
    console.log("sdcfjhklnkdsjnvjhdbhfjbvjbdfjvj");
    cb(null, file.originalname + '-' + Date.now() + '.xls');
  }
});

var upload = multer({ storage: storage });

var functions = require('./functions');


// ==========================================
module.exports = function(app, passport) {

    app.get('/', functions.student_loginfunc);

    app.post('/student_login', function(req, res, next){
        passport.authenticate('local-login-student', function (err, user, info) {
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
                return res.redirect('/main');
            });
            
        })(req,res,next),
        function(req, res) {
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/main');
        }
    });


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

    app.get('/create-session', functions.isLoggedInfunc, admin_access, functions.create_elective);

    app.post('/create_session',functions.isLoggedInfunc, admin_access, functions.create_session_post_form);
    // =====================================

    app.get('/dashboard', functions.isLoggedInfunc, admin_access, functions.dashboard);

    app.get('/manage', functions.isLoggedInfunc, admin_access, functions.manage);

    app.get('/elective/:token',functions.isLoggedInfunc, admin_access, functions.elective_stats);

    app.get('/past',functions.isLoggedInfunc, admin_access, functions.past_electives);

    app.get('/present',functions.isLoggedInfunc, admin_access, functions.present_electives);

    app.get('/student-data',functions.isLoggedInfunc, admin_access, functions.student_data)

    app.get('/courses',functions.isLoggedInfunc, admin_access, functions.display_courses);

    app.get('/courses/:id',functions.isLoggedInfunc, admin_access, functions.elective_courses);

    app.get('/admin_activity',functions.isLoggedInfunc, admin_access, functions.admin_activity);
    
    app.get('/reset/:id', functions.isLoggedInfunc, admin_access, functions.reset_archive);

    app.get('/settings',functions.isLoggedInfunc, admin_access, functions.settings);

    app.get('/download', function(req, res){
          var file = 'G:/Elective/Random/views/pics/avatar.png';
          res.download(file); // Set disposition and send it.
    });

    app.get('/create_admin', functions.isLoggedInfunc, admin_access, functions.create_admin);

    app.post('/create_admin', functions.isLoggedInfunc, admin_access, functions.create_new_admin);

    app.get('/upload', (req,res)=>{res.render("upload.ejs")});
    app.post('/upload',upload.single('media'), functions.upload);

    app.get('/broadcast', functions.isLoggedInfunc, admin_access, functions.broadcast);


  // #########################################################################################
  // ######################    STUDENT ROUTES   ###########################################
  // #########################################################################################


  app.get('/main',functions.isLoggedInfunc, student_access, functions.student_dashboard);

  app.get('/upcoming', functions.isLoggedInfunc, student_access, functions.upcoming_electives);




}


var student_access = function access(req,res,next){
    if(req.session.regNO) return next();
    return res.send("Not Allowed");
}

var admin_access = function access(req,res,next){
    if(req.session.user) return next();
    return res.send("Not Allowed");
}
