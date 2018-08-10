var express = require('express')
var app = express()
/*var xlsxtojson = require("xlsx-to-json");
var xlstojson = require("xls-to-json");
app.use(function(req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Max-Age", "3600");
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    next();
});
// configuration
app.use(express.static(__dirname + '/public'));               
app.use('/public/uploads',express.static(__dirname + '/public/uploads'));      
app.get('/', function (req, res) {
  res.send('Hello World')
})
app.get('/api', function(req, res) {
    xlsxtojson({
        input: "./oe_choices.ods",  // input xls
        output: "output.json", // output json
        lowerCaseHeaders:true
    }, function(err, result) {
        if(err) {
          res.json(err);
        } else {
          res.json(result);
        }
    });
});*/

const XLSX = require('xlsx');
const workbook = XLSX.readFile('./oe_choices.ods');
const sheet_name_list = workbook.SheetNames;

app.get('/api',function(req,res){
    details = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]],{header:["regno","cgpa","pref_1","pref_2","pref_3","pref_4","pref_5","pref_6","Date/time","gpa"], range:1});

    var mysql_data = [];
    for(i=0;i<details.length;i++)
         {
              mysql_data.push([details[i]["regno"],details[i]["cgpa"],details[i]["pref_1"],details[i]["pref_2"],details[i]["pref_3"],details[i]["pref_4"],details[i]["pref_5"],details[i]["pref_6"]]);
         }
       res.send(mysql_data);  
});

app.listen(3000);
        