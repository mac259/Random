
var LocalStrategy   = require('passport-local').Strategy;

var mysql = require('mysql');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);
var bcrypt = require('bcrypt-nodejs');

connection.query('USE ' + dbconfig.database);

module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
       if(user.userID) 
        done(null, user.userID);
       else if(user.regNO)
        done(null, user.regNO);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        console.log(id);
        if(isNaN(id)) 
        {    
                connection.query("SELECT * FROM admin WHERE userID = ? ",[id], function(err, rows){
                    if(err)
                        throw err;
                    else
                        done(err, rows[0]);
            });
        }
       else
       {    
                connection.query("SELECT * FROM students WHERE regNO= ? ",[id], function(err, rows){
                    if(err)
                        throw err;
                    else
                        done(err, rows[0]);
            });
        } 
    });



    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'id',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { 

            connection.query("SELECT * FROM admin WHERE userID = ?",[username], function(err, rows){
                if (err){
                    return done(err);
                }
                else if (!rows.length) {
                    return done(null, false, "No user found"); 
                }
                // if the user is found but the password is wrong
                else if (!bcrypt.compareSync(password, rows[0].pass)){

                    return done(null, false, "Oops! Wrong password"); // create the loginMessage and save it to session as flashdata
                }

                else{
                req.session.user = rows[0].userID;
                return done(null, rows[0], "Welcome");}
            });
        })
    );

     passport.use(
        'local-login-student',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'id',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { 

            connection.query("SELECT * FROM students WHERE regno = ?",[username], function(err, rows){
                if (err){
                    return done(err);
                }
                else if (!rows.length) {
                    return done(null, false, "No user found"); 
                }
                // if the user is found but the password is wrong
                else if (password!=rows[0].pass){

                    return done(null, false, "Oops! Wrong password"); // create the loginMessage and save it to session as flashdata
                }

                else{
                req.session.regNO = rows[0].regNO;
                req.session.dept = rows[0].dept;
                req.session.cgpa = rows[0].cgpa;
                return done(null, rows[0], "Welcome");}
            });
        })
    );

};
