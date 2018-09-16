create database muj_electives;
use muj_electives;

create table admin
(   userID  VARCHAR(30) NOT NULL,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    department VARCHAR(30) NOT NULL,
    privilages VARCHAR(30) NOT NULL,
    email VARCHAR(30) NOT NULL,
    pass VARCHAR(30) NOT NULL,
    SOA DATETIME NOT NULL,
    PRIMARY KEY(userID)
); 
alter TABLE admin modify email VARCHAR(100) NOT NULL;
alter TABLE admin modify pass VARCHAR(200) NOT NULL;

create table electives
(       
        elective_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        elective_name varchar(100) NOT NULL UNIQUE,
        userID varchar(20) NOT NULL,
        elective_type VARCHAR(20) NOT NULL,
        creation_time timestamp not null default NOW(),
        scheduled_live datetime not null,
        scheduled_allottment datetime not null,
        current_status VARCHAR(20) NOT NULL default "offline",
        allotted_table VARCHAR(100) not null unique,
        course_table varchar(100) not null unique,
        FOREIGN KEY(userID) REFERENCES admin(userID)
  );
  
  alter table electives add pref_table varchar(100) not null unique;
  
create table streams
(
        sm_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        stream VARCHAR(30) NOT NULL,
        branch VARCHAR(30) NOT NULL,
        semester int (30) NOT NULL
 );
 
 INSERT INTO test_streams(dept,branch,semester) VALUES
 ("C&CE","C&CE","III"),("C&CE","C&CE","IV"),("C&CE","C&CE","V"),("C&CE","C&CE","VI"),("C&CE","C&CE","VII"),("CSE","CSE","III"),("CSE","CSE","IV"),("CSE","CSE","V"),("CSE","CSE","VI"),("CSE","CSE","VII"),("IT","IT","III"),("IT","IT","IV"),("IT","IT","V"),("IT","IT","VI"),("IT","IT","VII");
 
 select * from test_streams;
 
 create table test_streams
(
        sm_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        dept VARCHAR(50) NOT NULL,
        branch VARCHAR(50) NOT NULL,
        semester VARCHAR(10) NOT NULL
 );
 
create table elective_data
(
        elective_id INT NOT NULL,
        sm_id INT NOT NULL,
        PRIMARY KEY(elective_id,sm_id),
        FOREIGN KEY(elective_id) REFERENCES electives(elective_id),
        FOREIGN KEY(sm_id) REFERENCES streams(sm_id)
 );
 

create table students
(       
        regNO NUMERIC(11) NOT NULL,
        std_name VARCHAR(30) NOT NULL,
        email VARCHAR(30) NOT NULL,
        pass VARCHAR(30) NOT NULL,
        sm_id INT NOT NULL,
        PRIMARY KEY(regNO),
        FOREIGN KEY(sm_id) REFERENCES streams(sm_id)
); 

create table session_students
(       
        regno NUMERIC(12) NOT NULL,
        sname VARCHAR(100) NOT NULL,
        cgpa1 numeric(8,6),
        cgpa2 numeric(8,6),
        sm_id INT NOT NULL,
        pr_oe1 varchar(50),
        pr_oe2 varchar(50),
        pass VARCHAR(30) NOT NULL,      
        PRIMARY KEY(regNO),
        FOREIGN KEY(sm_id) REFERENCES test_streams(sm_id)
); 
drop table session_students;
alter table test_student add pass varchar(30) not null;
desc test_student;

alter table students add cgpa numeric(5,3) NOT NULL;

create table courses
(       courseId VARCHAR(10) NOT NULL,
        course_name VARCHAR(50) NOT NULL,
        department VARCHAR(30) NOT NULL,
        max_capacity int not null default 60,
        course_details VARCHAR(500),
        PRIMARY KEY(courseID)
);

INSERT INTO COURSES(courseId,course_name,department) VALUES("CS1234","XYZ","CSE"),("CS1111","XYZ","CSE"),("CS1456","XYZ","CSE"),("CS5678","XYZ","CSE"),("CC1234","XYZ","CCE"),("CC1000","XYZ","CCE"),("CC1934","XYZ","CCE"),("CC1884","XYZ","CCE"),("CC9234","XYZ","CCE"),("ME1234","XYZ","MECHANICAL"),("ME1204","XYZ","MECHANICAL"),("ME9234","XYZ","MECHANICAL"),("ME1240","XYZ","MECHANICAL"),("PY1234","XYZ","PHYSICS");

create table oe_courses
(
        courseId VARCHAR(10) NOT NULL,
        sm_id INT NOT NULL,
        PRIMARY KEY(courseId,sm_id)
 );       

create table de_courses
(
        courseId VARCHAR(10) NOT NULL,
        sm_id INT NOT NULL,
        PRIMARY KEY(courseId,sm_id)
 ); 
 
show tables;

create table oe_preference
(   
    elective_id int NOT NULL,
    regno numeric(12) NOT NULL,
    p_one VARCHAR(30) NOT NULL,
    p_two VARCHAR(30) NOT NULL,
    p_three VARCHAR(30) NOT NULL,
    p_four VARCHAR(30) NOT NULL,
    p_five VARCHAR(30) NOT NULL,
    p_six VARCHAR(30) NOT NULL,
    allotted varchar(30),
    PRIMARY KEY(elective_id,regno),
    FOREIGN KEY(elective_id) references electives(elective_id),
    FOREIGN KEY(regno) references session_students(regno)
);

create table previous_oe_preferences
(   
    elective_id int NOT NULL,
    regno numeric(12) NOT NULL,
    cgpa numeric(8,6),
    gpa numeric(8,6),
    p_one VARCHAR(30) NOT NULL,
    p_two VARCHAR(30) NOT NULL,
    p_three VARCHAR(30) NOT NULL,
    p_four VARCHAR(30) NOT NULL,
    p_five VARCHAR(30) NOT NULL,
    p_six VARCHAR(30) NOT NULL,
    allotted varchar(30),
    PRIMARY KEY(elective_id,regno),
    FOREIGN KEY(elective_id) references electives(elective_id)
);

create table oe_pref_hlpr
(   
    regNo numeric(10) PRIMARY KEY,
    cgpa numeric(8,6),
    p_one VARCHAR(10),
    p_two VARCHAR(10),
    p_three VARCHAR(10),
    p_four VARCHAR(10),
    p_five VARCHAR(10),
    p_six VARCHAR(10),
    gpa numeric(8,6)
);

create table oe_allotted_hlpr
(   regno numeric,
    courseID varchar(10)
);
 

create table oe_courses_hlpr
(       courseId VARCHAR(10) NOT NULL,
        allotted int not null default 0
); 

create table broadcasts
(
        b_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        elective_id INT,
        userID VARCHAR(30) NOT NULL,
        subject_ VARCHAR(255) NOT NULL,
        description VARCHAR(3000) NOT NULL,
        FOREIGN KEY(elective_id) REFERENCES electives(elective_id),
        FOREIGN KEY(userID) REFERENCES admin(userID)
 );
 
 create table messages
(
        m_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        regNO NUMERIC(11) NOT NULL,
        userID VARCHAR(30) NOT NULL,
        subject_ VARCHAR(255) NOT NULL,
        description VARCHAR(3000) NOT NULL,
        read_mark smallint NOT NULL default 0,
        FOREIGN KEY(regNO) REFERENCES students(regNO),
        FOREIGN KEY(userID) REFERENCES admin(userID)
 );
 
  create table queries
(
        q_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
        regNO NUMERIC(11) NOT NULL,        
        subject_ VARCHAR(255) NOT NULL,
        description VARCHAR(3000) NOT NULL,
        resolved smallint NOT NULL default 0,
        FOREIGN KEY(regNO) REFERENCES students(regNO)
 );
 