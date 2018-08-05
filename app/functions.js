
var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

var express  = require('express');
var app = express();


var path = require('path');
var bcrypt = require('bcrypt-nodejs');


module.exports = {


  // #########################################################################################
  // ##############################    GENERAL FUNCTIONS   ###################################
  // #########################################################################################    


	loginfunc: function(req, res) {

        if (req.isAuthenticated())
        {
            res.redirect('/dashboard');
        }
        else
            res.render('login.ejs');

    },

    student_loginfunc: (req,res)=>{
        if (req.isAuthenticated())
        {
            res.redirect('/main');
        }
        else
            res.render('student_login.ejs');
    },


	isLoggedInfunc: function isLoggedIn(req, res, next) {


	    if (req.isAuthenticated()){
	        return next(null,1);
        }

	    res.redirect('/login');
	},


	logoutfunc: function(req, res) {
        admin = false
        if(req.session.user)
            admin = true;
        req.logout();
        req.session.destroy(function(err) {
            if(err) {
              console.log(err);
            } else {
                if(admin)  
                    res.redirect('/login');
                else
                    res.redirect('/');
            }
        });
    },


  // #########################################################################################
  // ##############################    ADMIN FUNCTIONS   #####################################
  // #########################################################################################     

    dashboard: function(req, res){

          res.render('Admin Pro 4/dashboard-index.ejs');
                                    

    },

    manage: (req,res)=>{
        res.render('manage.ejs');
    },

    create_admin: (req,res)=>{

        res.render("Admin Pro 4/create-admin-index.ejs");
    },


    create_new_admin: (req,res)=>{

        password = bcrypt.hashSync(req.body.password, null, null);
        insertQuery = "INSERT INTO admin(userID,first_name,last_name,department,privilages,email,pass,SOA) VALUES(?,?,?,?,?,?,?,?)";
        connection.query(insertQuery,[req.body.userid,req.body.first,req.body.last,req.body.dept,req.body.privilages,req.body.email,password,req.body.soa],(err,rows)=>{
                if(err)
                    throw err;
                else{
                    res.render("create-admin-index");
                }
        });

    },



    create_open_elective: (req,res)=>{

        SelectQuery = "SELECT * FROM courses where elective_id = ?";
        connection.query(SelectQuery,[undefined],(err,rows)=>{
            rows={rows};
            console.log(rows);
            res.render("create_elective.ejs",rows);

        });
    },


    create_oe_post_form: (req,res)=>{
        date = new Date();
        year = date.getFullYear();
        name = req.body.elective_name;
        allotted_table_name = name.replace(/ /g,'')+"_allotted_"+year;
        course_table_name = name.replace(/ /g,'')+"_courses_"+year;
        pref_table_name = name.replace(/ /g,'')+"_pref_"+year;
        insertQuery = "INSERT INTO electives(userID,elective_name,scheduled_live,scheduled_allottment,course_table,allotted_table,pref_table,elective_type) VALUES(?,?,?,?,?,?,?,?)"

                connection.query(insertQuery,[req.session.user,name,req.body.slive,req.body.sallott,course_table_name,allotted_table_name,pref_table_name,"open"],(err1,rows1)=>{
                       if(err1)
                            throw err1;
                        else{
                            //To do : create method to insert multiple sm_id maybe in trigger
                            sm_ids = [];
                            console.log(req.body.sm_ids);
                            for(i=0;i<req.body.sm_ids.length;i++)
                            {
                                sm_ids.push([rows1.insertId,req.body.sm_ids[i]])
                            }
                            console.log(sm_ids);
                            insertQuery2 = "INSERT INTO elective_data values ?";
                            connection.query(insertQuery2,[sm_ids],(err2,rows2)=>{
                                if(err2)
                                    throw err2;
                                else{
                                    res.redirect("/dashboard");
                                }
                            });
                        }
                    });
    },


    create_de_post_form: (req,res)=>{
        date = new Date();
        year = date.getFullYear();
        name = req.body.elective_name;
        allotted_table_name = name.replace(/ /g,'')+"_allotted_"+year;
        course_table_name = name.replace(/ /g,'')+"_courses_"+year;
        pref_table_name = name.replace(/ /g,'')+"_pref_"+year;
        insertQuery = "INSERT INTO electives(userID,elective_name,scheduled_live,scheduled_allottment,course_table,allotted_table,type) VALUES(?,?,?,?,?,?,?)"

                connection.query(insertQuery,[req.session.user,name,req.body.slive,req.body.sallott,course_table_name,allotted_table_name],(err1,rows1)=>{
                       if(err1)
                            throw err1;
                        else{
                            //To do : create method to insert multiple sm_id maybe in trigger
                            insertQuery2 = "INSERT INTO elective_data values (?)";
                            connection.query(insertQuery2,[rows1.insertId],(err2,rows2)=>{
                                if(err1)
                                    throw err2;
                                else{
                                    res.redirect("/dashboard");
                                }
                            });
                        }
                    });
    },


    call_oe_allotment:(req,res)=>{
        connection.query("call oe_allotment()",(err,rows)=>{
            if(err)
                throw err;
            else{
                res.redirect('/elective/open_2018');
            }
        });
    },



    elective_stats:(req,res)=>{
        SelectQuery = "SELECT courseID FROM courses where elective_id = ? ";
        connection.query(SelectQuery,[req.params.token],(err,rows)=>{
            if(err)
                throw err;
            else{
                rows = {rows};
                    res.render('elective_stats.ejs',rows);
                }


        });

    },

    display_courses: (req,res)=>{
        SelectQuery = "SELECT courseID FROM courses";
        connection.query(SelectQuery,(err,rows)=>{
            if(err)
                throw err;
            else{
                rows.courses = rows;
                console.log(rows);
                res.render('courses.ejs',rows);
            }
        });
    },

    elective_courses: (req,res)=>{

        e_id = req.params.id;
        SelectQuery = "SELECT courseID FROM courses where elective_id = ?";
        connection.query(SelectQuery,[e_id],(err,rows)=>{
            if(err)
                throw err;
            else{
                rows.courses = rows;
                console.log(rows);
                res.render('courses.ejs',rows);
            }
        });
    },


    past_electives : (req,res)=>{

        SelectQuery = "SELECT * FROM elective_data where userID = ? and current_status = 'completed'";
        connection.query(SelectQuery,[req.session.user],(err,rows)=>{
                if(err)
                    throw err;
                else{
                    rows.past = rows;
                    res.render('past.ejs',rows);
                }
        });        
    },

    present_electives : (req,res)=>{
        
        SelectQuery = "SELECT * FROM elective_data where userID = ? and current_status != 'completed'";
        connection.query(SelectQuery,[req.session.user],(err,rows)=>{
                if(err)
                    throw err;
                else{
                    rows.present = rows;
                    res.render('present.ejs',rows);
                }
        });        
    },

    student_data : (req,res)=>{
        res.render('student-data.ejs');
    },


    settings : (req,res)=>{
        res.render('settings.ejs');
    },


    admin_activity: (req,res)=>{

        SelectQuery = "SELECT courseID from courses";
        connection.query(SelectQuery,(err,rows)=>{
            if(err)
                throw err;
            else{
                courses = rows;
                 res.render('admin_activity.ejs',courses);
            }
        });
    },


    reset_archive: (req,res)=>{
        SelectQuery = "SELECT * from elective_data where elective_id = ?";
        connection.query(SelectQuery,[req.params.id],(err,rows)=>{
                if(err)
                    throw err;
                else{
                    pref_table_name = rows[0].elective_name;
                    allotted_table_name = rows[0].allotted_table;
                    createQuery = "Create table "+pref_table_name+" SELECT * from oe_preference";
                    connection.query(createQuery,(err,rows1)=>{
                            if(err)
                                throw err;
                            else{
                                createQuery = "Create table "+allotted_table_name+" SELECT * from allotted";
                                connection.query(createQuery,(err,rows2)=>{
                                    if(err)
                                        throw err;
                                    else{
                                        sql = "call truncate_tables("+req.params.id+")";
                                        connection.query("call truncate_tables()",(err,rows3)=>{
                                            if(err)
                                                throw err;
                                            else{
                                                res.redirect("/dashboard");
                                            }
                                        });
                                    }
                                });
                            }
                    });
                }
        });
    },



  // #########################################################################################
  // #############################  STUDENT FUNCTIONS   ######################################
  // #########################################################################################


    upcoming_electives: (req,res)=>{
        res.render('Student Pro 2/upcoming-redirect-index.ejs');
    }, 

    student_dashboard: (req,res)=>{

        SelectQuery = "SELECT * FROM electives,elective_data WHERE electives.elective_id = elective_data.elective_id  AND sm_id = (SELECT sm_id FROM students WHERE regno = ?)"
        connection.query(SelectQuery,[req.session.regNO],(err,rows)=>{
            if(err)
                throw err;
            else{

                res.render('Student Pro 2/student-index.ejs');
            }
        });        
    },

    contact_admin: (req,res)=>{

        insertQuery = "INSERT INTO queries";
    },

    fill_oe_form: (req,res)=>{

        SelectQuery = "SELECT * FROM electives,elective_data WHERE electives.elective_id = elective_data.elective_id AND sm_id = ? and elective_id = ?";
        connection.query(SelectQuery,[req.session.dept,req.params.id],(err,rows)=>{
            if(err)
                throw err;
            else if(rows.length==0)
                res.send("NOT FOUND");
            else{
                if(rows[0].current_status!="live")
                    res.send("NOT ALLOWED");
                else{
                            arr = [];
                            flag = false;
                            arr[1] = req.body.first, arr[2] = req.body.second, arr[3] = req.body.third, arr[4] = req.body.fourth, arr[5] = req.body.fifth, arr[6] = req.body.sixth;
                            for(i=1;i<=6;i++)
                                for (j=i+1;j<=6; j++) {
                                    if(arr[i]==arr[j])
                                    {
                                        flag = true;
                                    }
                                }
                            if(flag)
                            {
                                res.send("NOT ALLOWED:\n Choices should be distinct");
                            }
                            else{
                                insertQuery = "INSERT INTO "+rows[0].pref_table+" VALUES(?,?,?,?,?,?,?,?)";
                                connection.query(insertQuery,[req.session.regNO,arr[1],arr[2],arr[3],arr[4],arr[5],arr[6],req.session.cgpa],(err,rows)=>{
                                    if(err)
                                        throw err;
                                    else{
                                        res.redirect("/students");
                                    }
                                })
                            }
    
                }
            }
        });



    }


}
