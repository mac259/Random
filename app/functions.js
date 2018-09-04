
var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

var express  = require('express');
var app = express();


var path = require('path');
var bcrypt = require('bcrypt-nodejs');

const XLSX = require('xlsx');

const fs = require('fs');

var sem = require('semaphore')(1);

var schedule = require('node-schedule');


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
            res.render('admin_login.ejs');

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


    std_isLoggedInfunc: function isLoggedIn(req, res, next) {


        if (req.isAuthenticated()){
            return next(null,1);
        }

        res.redirect('/');
    },


    checked: (req,res)=>{
        res.send("success");
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

        res.render("Admin Pro 4/admins-index.ejs");
    },


    create_new_admin: (req,res)=>{

        password = bcrypt.hashSync(req.body.password, null, null);
        insertQuery = "INSERT INTO admin(userID,first_name,last_name,department,privilages,email,pass,SOA) VALUES(?,?,?,?,?,?,?,?)";
        connection.query(insertQuery,[req.body.userid,req.body.first,req.body.last,req.body.dept,req.body.privilages,req.body.email,password,req.body.soa],(err,rows)=>{
                if(err)
                    throw err;
                else{
                    res.render("Admin Pro 4/admins-index.ejs");
                }
        });

    },



    create_elective: (req,res)=>{

        connection.query("SELECT * FROM test_streams",(err,rows)=>{
            if(err)
                throw err;
            else{
                   connection.query("SELECT DISTINCT branch from test_streams",(err,rows2)=>{
                    if(err)
                        throw err;
                    else
                    {
                        info = {};
                        info.sems = rows;
                        info.branches = rows2;
                        console.log(info);
                        res.render("Admin Pro 4/create-session-index.ejs",info);
                    }
                   });
            }
        });
         

    },


    create_session_post_form: (req,res)=>{
        date = new Date();
        year = date.getFullYear();
        name = req.body.elective_name;
        allotted_table_name = name.replace(/ /g,'')+"_allotted_"+year;
        course_table_name = name.replace(/ /g,'')+"_courses_"+year;
        pref_table_name = name.replace(/ /g,'')+"_pref_"+year;
        insertQuery = "INSERT INTO electives(userID,elective_name,scheduled_live,scheduled_allottment,course_table,allotted_table,pref_table,elective_type) VALUES(?,?,?,?,?,?,?,?)"

                connection.query(insertQuery,[req.session.user,name,req.body.slive,req.body.sallott,course_table_name,allotted_table_name,pref_table_name,req.body.type],(err1,rows1)=>{
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

                                   /* function sleep(ms) {
                                        return new Promise(resolve => setTimeout(resolve, ms));
                                        }

                                    async function demo() {
                                          console.log('Taking a break...');
                                          await sleep(20000);
                                          console.log('Two second later');
                                    }
                                */
                                    schedule_session_live(rows1.insertId,req.body.slive);
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
        SelectQuery = "SELECT * FROM courses";
        connection.query(SelectQuery,(err,rows)=>{
            if(err)
                throw err;
            else{
                rows.courses = rows;
                //console.log(rows);
                res.render('Admin Pro 4/courses-index.ejs');
                //res.render('Admin Pro 4/courses-index.ejs',rows);
            }
        });
    },

    session_stats : (req,res)=>{

        connection.query('SELECT * FROM electives WHERE elective_id = ?',[req.params.id],(err,rows)=>{
            if(err)
                throw err;
            else{
                info = {};
                info.rows = rows;
                console.log(info);
                  res.render('Admin Pro 4/session-redirect-index.ejs',info);
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

    all_sessions : (req,res)=>{

        SelectQuery = "SELECT * FROM electives WHERE userID = ? ORDER BY creation_time DESC";
        connection.query(SelectQuery,[req.session.user],(err,rows)=>{
            if(err)
                throw err;
            else{
                info = {};
                info.rows = rows;
                res.render('Admin Pro 4/existing-sessions-index.ejs',info);
            }
        });
    },

    student_data : (req,res)=>{

        connection.query("SELECT regno,sname,semester,branch FROM session_students,test_streams where session_students.sm_id = test_streams.sm_id limit 10",(err,rows)=>{
            if(err)
                throw err;
            else{
                info = {};
                info.rows = rows; 
                 res.render('Admin Pro 4/student-data-index.ejs',info);
            }
        });       
    },


    settings : (req,res)=>{
        res.render('Admin Pro 4/settings-index.ejs');
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

    broadcast_notifications: (req,res)=>{

        SelectQuery = 'SELECT elective_name,elective_id FROM electives WHERE userID = ? AND current_status != "offline" ORDER BY creation_time DESC';
        connection.query(SelectQuery,[req.session.user],(err,rows)=>{
            if(err)
                throw err;
            else{
                res.render('Admin Pro 4/broadcast-index.ejs');
            }
        });        
    },

    notifications: (req,res)=>{

        SelectQuery = 'SELECT elective_name,elective_id FROM electives WHERE userID = ? AND current_status != "offline" ORDER BY creation_time DESC';
        connection.query(SelectQuery,[req.session.user],(err,rows)=>{
            if(err)
                throw err;
            else{
                res.render('Admin Pro 4/notifications-index.ejs');
            }
        });        
    },

    broadcast_post_form : (req,res)=>{

        InsertQuery = "INSERT INTO broadcasts(elective_id,userID,subject_,description) VALUES(?,?,?,?)";
        connection.query(InsertQuery,[req.body.elective_id,req.session.user,req.body.subject,req.body.description],(err,rows)=>{
            if(err)
                throw err;
            else{
                res.redirect('/broadcast');
            }
        });    
    },


    message_post_form : (req,res)=>{

        InsertQuery = "INSERT INTO messages(regNO,userID,subject_,description) VALUES(?,?,?,?)";
        connection.query(InsertQuery,[req.body.regNO,req.session.user,req.body.subject,req.body.description],(err,rows)=>{
            if(err)
                throw err;
            else{
                res.redirect('/broadcast');
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


    upload: function(req,res)
    {


        fl = req.file.filename;
        const workbook = XLSX.readFile(path.resolve('./views/excel/'+fl));
            const sheet_name_list = workbook.SheetNames;
            details = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]],{header:["regno","cgpa","pref_1","pref_2","pref_3","pref_4","pref_5","pref_6","Date/time","gpa"], range:1});

            var mysql_data = [];
            for(i=0;i<details.length;i++)
                 {
                      mysql_data.push([details[i]["regno"],details[i]["cgpa"],details[i]["pref_1"],details[i]["pref_2"],details[i]["pref_3"],details[i]["pref_4"],details[i]["pref_5"],details[i]["pref_6"],details[i]["gpa"]]);
                 }
            connection.query("INSERT INTO oe_pref_hlpr values ?",[mysql_data],(err,rows)=>{
                if(err)
                    throw err;
                else{
                    res.send("done");
                }
            });
            fs.unlink(path.resolve('./views/excel/'+fl), (err) => {
                  if (err) throw err;
                  console.log('successfully deleted');
});
},



    upload_student_data: function(req,res)
    {


        fl = req.file.filename;
        const workbook = XLSX.readFile(path.resolve('./views/excel/'+fl));
            const sheet_name_list = workbook.SheetNames;
            details = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]],{range:0});
            console.log(sheet_name_list.length);
            s = -1;
            info = {};

            for(k=0;k<sheet_name_list.length;k++)
                        {
                            var mysql_data = [];
                            
                            details = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[k]],{range:0});
                            console.log('done'+k);
                            for(i=0;i<details.length;i++)
                                 {    
                                      passwrd = Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(6, 8);  
                                      mysql_data.push([details[i]["Registration No."],details[i]["Name"],details[i]["II Yr CGPA"],details[i]["I Yr CGPA"],details[i]["Sem."],details[i]["Dept."],details[i]["Branch"],details[i]["Previous OE 1"],details[i]["Previous OE 2"],passwrd]);
                                 }
                         sem.take(function()
                            {connection.query("INSERT INTO test_student(regno,sname,cgpa2,cgpa1,sem,dept,branch,pr_oe1,pr_oe2,pass) values ?",[mysql_data],(err,rows)=>{
                               
                              
                              s++;
                              console.log('s = ',s);   
                                if(err)
                                {   
                                   if(s>0){
                                     console.log(err.sqlMessage);
                                     info.err = err.sqlMessage;
                                     //res.send(info);
                                     res.write("Sheet "+s+": ERROR "+err.sqlMessage);
                                     res.end();
                                     s = -88;
                                     }
                                }
                                else if(s==(sheet_name_list.length-1))
                                {   
                                    console.log("kjmnhbgvf");
                                    res.write("Sheet "+s+": "+rows.affectedRows+' rows inserted\n');
                                    res.end();
                                     //res.redirect('/dashboard');
                                     //s=-19999;
                                }
                                else{
                                    console.log(rows);
                                    res.write("Sheet "+s+": "+rows.affectedRows+' rows inserted\n');
                                }
                              sem.leave();
                            });
                        });
                
               
        }

            
            fs.unlink(path.resolve('./views/excel/'+fl), (err) => {
                  if (err) throw err;
                  console.log('successfully deleted');
            });
},





  // #########################################################################################
  // #############################  STUDENT FUNCTIONS   ######################################
  // #########################################################################################


    upcoming_electives: (req,res)=>{
        res.render('Student Pro 2/upcoming-redirect-index.ejs');
    }, 

    student_dashboard: (req,res)=>{

        SelectQuery = "SELECT * FROM electives,elective_data WHERE electives.elective_id = elective_data.elective_id  AND sm_id = (SELECT sm_id FROM session_students WHERE regno = ?)"
        connection.query(SelectQuery,[req.session.regNO],(err,rows)=>{
            if(err)
                throw err;
            else{
                info = {};
                info.rows = rows;
                console.log(info);
                res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                res.render('Student Pro 2/student-index.ejs',info);
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
                                    if(arr[i]==undefined||arr[i]==arr[j])
                                    {
                                        flag = true;
                                    }
                                }
                            if(flag)
                            {
                                res.send("NOT ALLOWED:\n Choices should be distinct");
                            }
                            else{
                                insertQuery = "INSERT INTO oe_preference(elective_id,regno,p_one,p_two,p_three,p_four,p_five,p_six) VALUES(?,?,?,?,?,?,?,?)";
                                connection.query(insertQuery,[req.params.id,req.session.regNO,arr[1],arr[2],arr[3],arr[4],arr[5],arr[6]],(err,rows)=>{
                                    if(err)
                                        throw err;
                                    else{
                                        res.redirect("/main");
                                    }
                                })
                            }
    
                }
            }
        });



    }


}

function schedule_session_live(id,datetime){
        // config things that we need
        var j = schedule.scheduleJob(datetime, function(){
          connection.query("update electives set current_status = 'live' where elective_id = ?",[id],(err,rows)=>{
            if(err)
                throw err;
            else{
                console.log('updated status for elective_id = ',id);
            }
          });
});
    }
