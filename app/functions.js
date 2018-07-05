
var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

var express  = require('express');
var app = express();


var path = require('path');


module.exports = {


	loginfunc: function(req, res) {

        if (req.isAuthenticated())
        {
            res.redirect('/dashboard');
        }
        else
            res.render('login.ejs');

    },


	isLoggedInfunc: function isLoggedIn(req, res, next) {


	    if (req.isAuthenticated()){
	        return next(null,1);
        }

	    res.redirect('/login');
	},


	logoutfunc: function(req, res) {
        req.logout();
        req.session.destroy(function(err) {
            if(err) {
              console.log(err);
            } else {
              res.redirect('/login');
            }
        });
    },

    dashboard: function(req, res){

        SelectQuery = "SELECT * FROM elective_data where userID = ? and current_status != 'completed'";
        connection.query(SelectQuery,[req.session.user],(err,rows)=>{
                if(err)
                    throw err;
                else{
                        user = {rows};
                        user.name = req.session.user;
                        SelectQuery = "SELECT * FROM elective_data where userID = ? and current_status = 'completed'";
                        connection.query(SelectQuery,[req.session.user],(err,rows1)=>{
                                if(err)
                                    throw err;
                                else{
                                    user.completed = rows1;
                                    console.log(user);
                                    res.render('dashboard.ejs',user);
                                    
                                }
                        });
                }
        });
    },

    manage: (req,res)=>{
        res.render('manage.ejs');
    },


    preference_post_form: (req,res)=>{

        insertQuery = "INSERT INTO preference VALUES(?,?,?,?,?,?,?,?)";
        connection.query(insertQuery,[],(err,rows)=>{
            if(err)
                throw err;
            else{
                res.redirect('/dashboard');
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
        name = "open_"+year;
        allotted_table_name = name+"_allotted";
                connection.query("INSERT INTO elective_data(userID,elective_name,allotted_table) VALUES(?,?,?)",[req.session.user,name,allotted_table_name],(err1,rows1)=>{
                       if(err1)
                            throw err1;
                        else{

                            connection.query("UPDATE COURSES SET elective_id = ?",[rows1.insertId],(err2,rows2)=>{
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


    create_oe_proc: (req,res)=>{

        elective = req.body.elective;


        createQuery = "create procedure "+name+"() begin   DECLARE regn numeric(10);   DECLARE maximum INTEGER DEFAULT 0;  DECLARE id_one VARCHAR(10); DECLARE id_two VARCHAR(10);    DECLARE  id_three VARCHAR(10);       DECLARE id_four VARCHAR(10);      DECLARE   id_five VARCHAR(10);    DECLARE id_six VARCHAR(10);     DECLARE  temp_preference VARCHAR(10);       CREATE TEMPORARY TABLE tmp1 (id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY)  SELECT * FROM oe_preference order by cgpa desc;    SELECT MAX(id) into maximum from tmp1;       CREATE TEMPORARY TABLE tmp_pref (id INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,pref varchar(10));     set @n = 1;         iter:LOOP       if @n > maximum         then        leave iter;          end if;      select regno,p_one,p_two,p_three,p_four,p_five,p_six into regn,id_one,id_two,id_three,id_four,id_five,id_six from tmp1 where id = @n;               insert into tmp_pref (pref) values(id_one),(id_two),(id_three),(id_four),(id_five),(id_six);          set @flag=true;         set @i=1;           while @flag and @i<7        do          select pref into temp_preference from tmp_pref where id = @i;           call oe_allot(regn,temp_preference,@flag);          set @i = @i +1;             end while;          if @flag and @i=7           then        insert into not_allotted values(regn);      end if;         truncate tmp_pref;        set @n = @n+1;        end loop iter;   end;";
                connection.query(createQuery,(err,rows)=>{
                    if(err)
                        throw err;
                    else
                        connection.query("INSERT INTO admin_elect VALUES(?,?)",[req.body.user,name],(err,rows1)=>{
                            res.send("done");
                        });
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
        res.render('courses.ejs');
    },


    past_electives : (req,res)=>{
        res.render('past.ejs');
    },

    present_electives : (req,res)=>{
        res.render('present.ejs');
    },

    student_data : (req,res)=>{
        res.render('student-data.ejs');
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
    }


}
